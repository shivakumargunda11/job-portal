package com.careerconnect.service;

import com.careerconnect.entity.Application;
import com.careerconnect.entity.ApplicationStatus;
import com.careerconnect.entity.Opportunity;
import com.careerconnect.entity.User;
import com.careerconnect.repository.ApplicationRepository;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final OpportunityService opportunityService;
    private final FileStorageService fileStorageService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              OpportunityService opportunityService,
                              FileStorageService fileStorageService) {
        this.applicationRepository = applicationRepository;
        this.opportunityService = opportunityService;
        this.fileStorageService = fileStorageService;
    }

    public Application apply(User student, Long opportunityId, MultipartFile resumeFile, String coverNote) {
        Opportunity opportunity = opportunityService.findById(opportunityId);

        // Check for duplicate application
        if (applicationRepository.existsByStudentAndOpportunity(student, opportunity)) {
            throw new IllegalStateException("You have already applied to this opportunity.");
        }

        // Store and validate resume file
        FileStorageService.StoredFileInfo fileInfo = fileStorageService.storeResume(resumeFile);

        Application application = new Application();
        application.setStudent(student);
        application.setOpportunity(opportunity);
        application.setResumePath(fileInfo.getStoredFileName());
        application.setResumeOriginalName(fileInfo.getOriginalFileName());
        application.setResumeContentType(fileInfo.getContentType());
        application.setResumeSize(fileInfo.getSize());
        application.setCoverNote(coverNote != null && !coverNote.isBlank() ? coverNote.trim() : null);

        return applicationRepository.save(application);
    }

    public List<Application> getStudentApplications(User student) {
        return applicationRepository.findByStudent(student);
    }

    public List<Application> getOpportunityApplications(Long opportunityId, User recruiter) {
        Opportunity opportunity = opportunityService.findById(opportunityId);
        if (opportunity.getOwner() == null || !opportunity.getOwner().getId().equals(recruiter.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this opportunity.");
        }
        return applicationRepository.findByOpportunity(opportunity);
    }

    public Application updateStatus(Long applicationId, String status, User recruiter) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));
        if (app.getOpportunity().getOwner() == null || !app.getOpportunity().getOwner().getId().equals(recruiter.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this opportunity.");
        }
        app.setStatus(ApplicationStatus.valueOf(status.toUpperCase()));
        return applicationRepository.save(app);
    }

    public Application findById(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));
    }

    public Resource loadResumeResource(Long applicationId, User currentUser) {
        Application app = findById(applicationId);

        if (app.getResumePath() == null || app.getResumePath().isBlank()) {
            throw new RuntimeException("No resume attached to this application.");
        }

        boolean isApplicant = app.getStudent().getId().equals(currentUser.getId());
        boolean isRecruiter = app.getOpportunity().getOwner() != null
                && app.getOpportunity().getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRoles() != null && currentUser.getRoles().contains("ROLE_ADMIN");

        if (!isApplicant && !isRecruiter && !isAdmin) {
            throw new AccessDeniedException("Access denied: You are not authorized to download this resume.");
        }

        return fileStorageService.loadAsResource(app.getResumePath());
    }
}
