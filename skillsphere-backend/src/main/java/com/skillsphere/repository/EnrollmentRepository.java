package com.skillsphere.repository;

import com.skillsphere.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudentId(Long studentId);
    List<Enrollment> findByStudentIdOrderByEnrolledAtDesc(Long studentId);
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<Enrollment> findByCourseId(Long courseId);
    long countByCourseId(Long courseId);
    long countByStudentId(Long studentId);
    long countByCourseMentorId(Long mentorId);
    List<Enrollment> findTop5ByCourseMentorIdOrderByEnrolledAtDesc(Long mentorId);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    @Query("select count(distinct e.student.id) from Enrollment e where e.course.mentor.id = :mentorId")
    long countDistinctStudentsByMentorId(@Param("mentorId") Long mentorId);
}
