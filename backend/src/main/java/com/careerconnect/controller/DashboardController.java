package com.careerconnect.controller;

import com.careerconnect.entity.Application;
import com.careerconnect.entity.User;
import com.careerconnect.repository.ApplicationRepository;
import com.careerconnect.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final UserService userService;
    private final ApplicationRepository applicationRepository;

    public DashboardController(UserService userService, ApplicationRepository applicationRepository) {
        this.userService = userService;
        this.applicationRepository = applicationRepository;
    }

    @GetMapping("/student")
    public ResponseEntity<?> studentProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        Map<String, Object> m = new HashMap<>();
        m.put("username", user.getUsername());
        m.put("fullName", user.getFullName() != null ? user.getFullName() : "");
        m.put("email", user.getEmail() != null ? user.getEmail() : "");
        m.put("roles", user.getRoles());
        return ResponseEntity.ok(m);
    }

    @GetMapping("/recruiter")
    public ResponseEntity<?> recruiterProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        Map<String, Object> m = new HashMap<>();
        m.put("username", user.getUsername());
        m.put("fullName", user.getFullName() != null ? user.getFullName() : "");
        m.put("email", user.getEmail() != null ? user.getEmail() : "");
        m.put("roles", user.getRoles());
        return ResponseEntity.ok(m);
    }

    @GetMapping("/admin/users")
    public List<Map<String, Object>> allUsers() {
        return userService.findAll().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("username", u.getUsername());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("roles", u.getRoles());
            return m;
        }).toList();
    }

    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }

    @GetMapping("/admin/applications")
    public List<Map<String, Object>> allApplications() {
        return applicationRepository.findAll().stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("studentUsername", a.getStudent().getUsername());
            m.put("studentName", a.getStudent().getFullName());
            m.put("opportunityTitle", a.getOpportunity().getTitle());
            m.put("appliedAt", a.getAppliedAt());
            m.put("status", a.getStatus().name());
            m.put("resumeOriginalName", a.getResumeOriginalName());
            m.put("resumeSize", a.getResumeSize());
            m.put("coverNote", a.getCoverNote());
            m.put("hasResume", a.getResumePath() != null);
            return m;
        }).toList();
    }
}
