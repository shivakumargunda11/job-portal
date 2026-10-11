package com.careerconnect.controller;

import com.careerconnect.entity.Bookmark;
import com.careerconnect.entity.User;
import com.careerconnect.service.BookmarkService;
import com.careerconnect.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;
    private final UserService userService;

    public BookmarkController(BookmarkService bookmarkService, UserService userService) {
        this.bookmarkService = bookmarkService;
        this.userService = userService;
    }

    @GetMapping("/my")
    public List<Map<String, Object>> list(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByUsername(userDetails.getUsername());
        return bookmarkService.getBookmarks(student).stream().map(b -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", b.getId());
            m.put("opportunityId", b.getOpportunity().getId());
            m.put("opportunityTitle", b.getOpportunity().getTitle());
            m.put("organization", b.getOpportunity().getOrganization());
            m.put("savedAt", b.getSavedAt());
            return m;
        }).toList();
    }

    @PostMapping("/{opportunityId}")
    public ResponseEntity<?> add(@PathVariable Long opportunityId,
                                 @AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByUsername(userDetails.getUsername());
        try {
            return ResponseEntity.ok(bookmarkService.addBookmark(student, opportunityId));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{bookmarkId}")
    public ResponseEntity<?> remove(@PathVariable Long bookmarkId,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByUsername(userDetails.getUsername());
        bookmarkService.removeBookmarkById(student, bookmarkId);
        return ResponseEntity.ok("Removed");
    }
}
