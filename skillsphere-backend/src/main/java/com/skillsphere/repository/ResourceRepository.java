package com.skillsphere.repository;

import com.skillsphere.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByLessonIdOrderByOrderIndexAsc(Long lessonId);
    List<Resource> findByLessonIdOrderByOrderIndexAscIdAsc(Long lessonId);
    Optional<Resource> findByIdAndLessonId(Long id, Long lessonId);
    long countByLessonId(Long lessonId);
}
