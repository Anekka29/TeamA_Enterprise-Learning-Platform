package com.skillsphere.repository;

import com.skillsphere.entity.Course;
import com.skillsphere.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCourse(Course course);
    Optional<Quiz> findByIdAndCourseId(Long id, Long courseId);
    List<Quiz> findByCourseAndPublishedTrue(Course course);
    long countByCourseMentorIdAndPublishedFalse(Long mentorId);
    long countByCourseId(Long courseId);
}
