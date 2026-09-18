package com.skillsphere.controller;

import com.skillsphere.dto.AssignmentResponse;
import com.skillsphere.dto.AssignmentSubmissionResponse;
import com.skillsphere.dto.CreateAssignmentRequest;
import com.skillsphere.dto.GradeAssignmentRequest;
import com.skillsphere.dto.SubmitAssignmentRequest;
import com.skillsphere.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    // Mentor endpoints
    @PostMapping("/mentor/courses/{courseId}/assignments")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @PathVariable Long courseId,
            @RequestBody CreateAssignmentRequest request
    ) {
        return ResponseEntity.ok(assignmentService.createAssignment(courseId, request));
    }

    @GetMapping("/mentor/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentSubmissionResponse>> getSubmissionsForAssignment(
            @PathVariable Long assignmentId
    ) {
        return ResponseEntity.ok(assignmentService.getSubmissionsForAssignment(assignmentId));
    }

    @PutMapping("/mentor/submissions/{submissionId}/grade")
    public ResponseEntity<AssignmentSubmissionResponse> gradeAssignment(
            @PathVariable Long submissionId,
            @RequestBody GradeAssignmentRequest request
    ) {
        return ResponseEntity.ok(assignmentService.gradeAssignment(submissionId, request));
    }

    // Student endpoints
    @GetMapping("/student/assignments")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsForStudent() {
        return ResponseEntity.ok(assignmentService.getAssignmentsForStudent());
    }

    @GetMapping("/student/courses/{courseId}/assignments")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsForCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsForCourse(courseId));
    }

    @GetMapping("/student/assignments/{assignmentId}")
    public ResponseEntity<AssignmentResponse> getAssignment(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(assignmentService.getAssignment(assignmentId));
    }

    @PostMapping("/student/assignments/{assignmentId}/submit")
    public ResponseEntity<AssignmentSubmissionResponse> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestBody SubmitAssignmentRequest request
    ) {
        return ResponseEntity.ok(assignmentService.submitAssignment(assignmentId, request));
    }

    @GetMapping("/student/assignments/{assignmentId}/submission")
    public ResponseEntity<AssignmentSubmissionResponse> getSubmissionForStudent(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(assignmentService.getSubmissionForStudent(assignmentId));
    }
}
