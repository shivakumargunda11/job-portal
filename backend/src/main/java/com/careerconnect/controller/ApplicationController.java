package com.careerconnect.controller;

import com.careerconnect.entity.Application;
import com.careerconnect.entity.User;
import com.careerconnect.service.ApplicationService;
import com.careerconnect.service.UserService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserService userService;

    public ApplicationController(ApplicationService applicationService, UserService userService) {
        this.applicationService = applicationService;
        this.userService = userService;
    }

    // Student applies with resume
    @PostMapping(value = "/apply/{opportunityId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> apply(
            @PathVariable Long opportunityId,
            @RequestParam("resume") MultipartFile resume,
            @RequestParam(value = "coverNote", required = false) String coverNote,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }
        User student = userService.findByUsername(userDetails.getUsername());
        try {
            Application app = applicationService.apply(student, opportunityId, resume, coverNote);
            Map<String, Object> resp = new HashMap<>();
            resp.put("id", app.getId());
            resp.put("status", app.getStatus().name());
            resp.put("appliedAt", app.getAppliedAt());
            resp.put("resumeOriginalName", app.getResumeOriginalName());
            resp.put("resumeSize", app.getResumeSize());
            resp.put("message", "Application submitted successfully!");
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to process application: " + e.getMessage());
        }
    }

    // Student views their own applications
    @GetMapping("/my")
    public List<Map<String, Object>> myApplications(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByUsername(userDetails.getUsername());
        return applicationService.getStudentApplications(student).stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("opportunityId", a.getOpportunity().getId());
            m.put("opportunityTitle", a.getOpportunity().getTitle());
            m.put("organization", a.getOpportunity().getOrganization());
            m.put("appliedAt", a.getAppliedAt());
            m.put("status", a.getStatus().name());
            m.put("resumeOriginalName", a.getResumeOriginalName());
            m.put("resumeSize", a.getResumeSize());
            m.put("resumeContentType", a.getResumeContentType());
            m.put("coverNote", a.getCoverNote());
            m.put("hasResume", a.getResumePath() != null);
            return m;
        }).toList();
    }

    // Recruiter views applicants for an opportunity
    @GetMapping("/opportunity/{opportunityId}")
    public ResponseEntity<?> applicantsFor(@PathVariable Long opportunityId,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        User recruiter = userService.findByUsername(userDetails.getUsername());
        try {
            List<Map<String, Object>> result = applicationService.getOpportunityApplications(opportunityId, recruiter)
                    .stream().map(a -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", a.getId());
                        m.put("studentUsername", a.getStudent().getUsername());
                        m.put("studentName", a.getStudent().getFullName());
                        m.put("studentEmail", a.getStudent().getEmail());
                        m.put("appliedAt", a.getAppliedAt());
                        m.put("status", a.getStatus().name());
                        m.put("resumeOriginalName", a.getResumeOriginalName());
                        m.put("resumeSize", a.getResumeSize());
                        m.put("resumeContentType", a.getResumeContentType());
                        m.put("coverNote", a.getCoverNote());
                        m.put("hasResume", a.getResumePath() != null);
                        return m;
                    }).toList();
            return ResponseEntity.ok(result);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Download/View resume file
    @GetMapping("/{applicationId}/resume")
    public ResponseEntity<?> downloadResume(@PathVariable Long applicationId,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }
        User currentUser = userService.findByUsername(userDetails.getUsername());
        try {
            Application app = applicationService.findById(applicationId);
            Resource resource = applicationService.loadResumeResource(applicationId, currentUser);

            String contentType = app.getResumeContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = "application/octet-stream";
            }

            String filename = app.getResumeOriginalName() != null ? app.getResumeOriginalName() : "resume";
            String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + encodedFilename + "\"; filename*=UTF-8''" + encodedFilename)
                    .body(resource);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // Update application status
    @PutMapping("/{applicationId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long applicationId,
                                           @RequestParam String status,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        User recruiter = userService.findByUsername(userDetails.getUsername());
        try {
            Application updated = applicationService.updateStatus(applicationId, status, recruiter);
            return ResponseEntity.ok(updated);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
