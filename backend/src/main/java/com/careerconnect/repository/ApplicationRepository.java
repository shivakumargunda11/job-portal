package com.careerconnect.repository;

import com.careerconnect.entity.Application;
import com.careerconnect.entity.Opportunity;
import com.careerconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudent(User student);
    List<Application> findByOpportunity(Opportunity opportunity);
    boolean existsByStudentAndOpportunity(User student, Opportunity opportunity);
}
