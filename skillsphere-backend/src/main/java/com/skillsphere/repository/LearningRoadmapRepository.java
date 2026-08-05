package com.skillsphere.repository;

import com.skillsphere.entity.LearningRoadmap;
import com.skillsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningRoadmapRepository extends JpaRepository<LearningRoadmap, Long> {
    List<LearningRoadmap> findByUserOrderByCreatedAtDesc(User user);
    Optional<LearningRoadmap> findTopByUserOrderByCreatedAtDesc(User user);
}
