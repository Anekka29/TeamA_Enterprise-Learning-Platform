package com.skillsphere.service;

import com.skillsphere.dto.AssignmentResponse;
import com.skillsphere.dto.AssignmentSubmissionResponse;
import com.skillsphere.dto.CreateAssignmentRequest;
import com.skillsphere.dto.GradeAssignmentRequest;
import com.skillsphere.dto.SubmitAssignmentRequest;

import java.util.List;

public interface AssignmentService {
    AssignmentResponse createAssignment(Long courseId, CreateAssignmentRequest request);
    List<AssignmentResponse> getAssignmentsForCourse(Long courseId);
    List<AssignmentResponse> getAssignmentsForStudent();
    AssignmentResponse getAssignment(Long assignmentId);
    AssignmentSubmissionResponse submitAssignment(Long assignmentId, SubmitAssignmentRequest request);
    List<AssignmentSubmissionResponse> getSubmissionsForAssignment(Long assignmentId);
    AssignmentSubmissionResponse getSubmissionForStudent(Long assignmentId);
    AssignmentSubmissionResponse gradeAssignment(Long submissionId, GradeAssignmentRequest request);
}
