package com.skillsphere.repository;

import com.skillsphere.entity.SkillGapAnalysis;
import com.skillsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillGapAnalysisRepository extends JpaRepository<SkillGapAnalysis, Long> {
    List<SkillGapAnalysis> findByUserOrderByCreatedAtDesc(User user);
}
