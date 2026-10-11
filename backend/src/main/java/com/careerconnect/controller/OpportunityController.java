package com.careerconnect.controller;

import com.careerconnect.dto.OpportunityRequest;
import com.careerconnect.entity.Opportunity;
import com.careerconnect.entity.User;
import com.careerconnect.service.OpportunityService;
import com.careerconnect.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/opportunities")
public class OpportunityController {

    private final OpportunityService opportunityService;
    private final UserService userService;

    public OpportunityController(OpportunityService opportunityService, UserService userService) {
        this.opportunityService = opportunityService;
        this.userService = userService;
    }

    @GetMapping
    public Page<Opportunity> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (!category.isBlank()) {
            return opportunityService.searchByCategory(category, search, pageable);
        }
        return opportunityService.search(search, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Opportunity> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(opportunityService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/my")
    public Page<Opportunity> myOpportunities(@AuthenticationPrincipal UserDetails userDetails,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "50") int size) {
        User user = userService.findByUsername(userDetails.getUsername());
        return opportunityService.findByOwner(user, PageRequest.of(page, size, Sort.by("id").descending()));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody OpportunityRequest request,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        Opportunity created = opportunityService.create(request, user);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @Valid @RequestBody OpportunityRequest request,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        try {
            return ResponseEntity.ok(opportunityService.update(id, request, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        try {
            opportunityService.delete(id, user);
            return ResponseEntity.ok("Deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
