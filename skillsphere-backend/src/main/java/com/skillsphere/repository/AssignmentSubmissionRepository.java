package com.skillsphere.repository;

import com.skillsphere.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);
    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    List<AssignmentSubmission> findByStudentId(Long studentId);
    long countByAssignmentCourseMentorIdAndGradeIsNull(Long mentorId);
    List<AssignmentSubmission> findTop5ByAssignmentCourseMentorIdOrderBySubmittedAtDesc(Long mentorId);
}
