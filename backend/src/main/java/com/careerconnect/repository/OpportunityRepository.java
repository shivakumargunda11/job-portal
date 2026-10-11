package com.careerconnect.repository;

import com.careerconnect.entity.Opportunity;
import com.careerconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {
    Page<Opportunity> findByPublishedTrue(Pageable pageable);

    Page<Opportunity> findByPublishedTrueAndTitleContainingIgnoreCaseOrPublishedTrueAndOrganizationContainingIgnoreCase(
            String title, String organization, Pageable pageable);

    Page<Opportunity> findByPublishedTrueAndCategoryIgnoreCase(String category, Pageable pageable);

    Page<Opportunity> findByPublishedTrueAndCategoryIgnoreCaseAndTitleContainingIgnoreCase(
            String category, String title, Pageable pageable);

    Page<Opportunity> findByOwner(User owner, Pageable pageable);
}
