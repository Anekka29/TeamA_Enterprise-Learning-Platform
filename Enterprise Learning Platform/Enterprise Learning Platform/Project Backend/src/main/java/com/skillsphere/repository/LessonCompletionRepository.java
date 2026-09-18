package com.skillsphere.repository;

import com.skillsphere.entity.LessonCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonCompletionRepository extends JpaRepository<LessonCompletion, Long> {
    Optional<LessonCompletion> findByStudentIdAndLessonId(Long studentId, Long lessonId);
    List<LessonCompletion> findByEnrollmentId(Long enrollmentId);
    List<LessonCompletion> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<LessonCompletion> findTop20ByStudentIdOrderByCompletedAtDesc(Long studentId);
    List<LessonCompletion> findTop5ByCourseMentorIdOrderByCompletedAtDesc(Long mentorId);
    long countByStudentId(Long studentId);
    long countByEnrollmentId(Long enrollmentId);
}
