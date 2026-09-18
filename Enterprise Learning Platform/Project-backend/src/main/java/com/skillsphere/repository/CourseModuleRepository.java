package com.skillsphere.repository;

import com.skillsphere.entity.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {
    List<CourseModule> findByCourseIdOrderByOrderIndexAsc(Long courseId);
    List<CourseModule> findByCourseIdOrderByOrderIndexAscIdAsc(Long courseId);
    Optional<CourseModule> findByIdAndCourseId(Long id, Long courseId);
    long countByCourseId(Long courseId);

    @org.springframework.data.jpa.repository.Query("SELECT m.course.id, COUNT(m) FROM CourseModule m WHERE m.course.id IN :courseIds GROUP BY m.course.id")
    List<Object[]> countModulesByCourseIds(@org.springframework.data.repository.query.Param("courseIds") List<Long> courseIds);
}
