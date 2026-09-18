package com.skillsphere.repository;

import com.skillsphere.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByModuleIdOrderByOrderIndexAsc(Long moduleId);
    List<Lesson> findByModuleIdOrderByOrderIndexAscIdAsc(Long moduleId);
    Optional<Lesson> findByIdAndModuleId(Long id, Long moduleId);
    long countByModuleId(Long moduleId);
    long countByModuleCourseId(Long courseId);
}
