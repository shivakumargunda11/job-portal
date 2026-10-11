package com.careerconnect.service;

import com.careerconnect.dto.OpportunityRequest;
import com.careerconnect.entity.Opportunity;
import com.careerconnect.entity.User;
import com.careerconnect.entity.WorkMode;
import com.careerconnect.repository.OpportunityRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;

    public OpportunityService(OpportunityRepository opportunityRepository) {
        this.opportunityRepository = opportunityRepository;
    }

    public Page<Opportunity> search(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            return opportunityRepository.findByPublishedTrue(pageable);
        }
        return opportunityRepository.findByPublishedTrueAndTitleContainingIgnoreCaseOrPublishedTrueAndOrganizationContainingIgnoreCase(
                keyword, keyword, pageable);
    }

    public Page<Opportunity> searchByCategory(String category, String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            return opportunityRepository.findByPublishedTrueAndCategoryIgnoreCase(category, pageable);
        }
        return opportunityRepository.findByPublishedTrueAndCategoryIgnoreCaseAndTitleContainingIgnoreCase(
                category, keyword, pageable);
    }

    public Opportunity findById(Long id) {
        return opportunityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Opportunity not found: " + id));
    }

    public Opportunity create(OpportunityRequest req, User owner) {
        Opportunity o = mapFromRequest(req, new Opportunity());
        o.setOwner(owner);
        return opportunityRepository.save(o);
    }

    public Opportunity update(Long id, OpportunityRequest req, User currentUser) {
        Opportunity o = findById(id);
        if (!o.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: you don't own this opportunity");
        }
        mapFromRequest(req, o);
        return opportunityRepository.save(o);
    }

    public void delete(Long id, User currentUser) {
        Opportunity o = findById(id);
        boolean isOwner = o.getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRoles().contains("ROLE_ADMIN");
        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Access denied");
        }
        opportunityRepository.delete(o);
    }

    public Page<Opportunity> findByOwner(User owner, Pageable pageable) {
        return opportunityRepository.findByOwner(owner, pageable);
    }

    private Opportunity mapFromRequest(OpportunityRequest req, Opportunity o) {
        o.setTitle(req.getTitle());
        o.setOrganization(req.getOrganization());
        o.setDescription(req.getDescription());
        o.setCategory(req.getCategory());
        o.setImageUrl(req.getImageUrl());
        o.setLocation(req.getLocation());
        if (req.getWorkMode() != null && !req.getWorkMode().isBlank()) {
            try {
                o.setWorkMode(WorkMode.valueOf(req.getWorkMode().toUpperCase().trim()));
            } catch (Exception e) {
                o.setWorkMode(WorkMode.REMOTE);
            }
        } else {
            o.setWorkMode(null);
        }
        o.setEligibility(req.getEligibility());
        o.setRequiredSkills(req.getRequiredSkills());
        // Parse deadline string (yyyy-MM-dd or dd-MM-yyyy)
        if (req.getDeadline() != null && !req.getDeadline().isBlank()) {
            try {
                if (req.getDeadline().matches("\\d{2}-\\d{2}-\\d{4}")) {
                    // dd-MM-yyyy format
                    String[] parts = req.getDeadline().split("-");
                    o.setDeadline(java.time.LocalDate.of(
                            Integer.parseInt(parts[2]), Integer.parseInt(parts[1]), Integer.parseInt(parts[0])));
                } else {
                    o.setDeadline(java.time.LocalDate.parse(req.getDeadline()));
                }
            } catch (Exception ignored) { o.setDeadline(null); }
        } else {
            o.setDeadline(null);
        }
        o.setReward(req.getReward());
        o.setPublished(req.isPublished());
        return o;
    }
}

