package com.careerconnect.repository;

import com.careerconnect.entity.Bookmark;
import com.careerconnect.entity.Opportunity;
import com.careerconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByStudent(User student);
    List<Bookmark> findByOpportunity(Opportunity opportunity);
    boolean existsByStudentAndOpportunity(User student, Opportunity opportunity);
    void deleteByStudentAndOpportunity(User student, Opportunity opportunity);
}
