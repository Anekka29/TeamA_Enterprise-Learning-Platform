package com.skillsphere.controller;

import com.skillsphere.dto.EnrollmentResponse;
import com.skillsphere.dto.EnrollmentRequest;
import com.skillsphere.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/student/courses/{courseId}/enroll")
    public ResponseEntity<EnrollmentResponse> enrollCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.enrollStudent(courseId));
    }

    @PostMapping("/enrollments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentResponse> createEnrollment(@Valid @RequestBody EnrollmentRequest request) {
        return ResponseEntity.ok(enrollmentService.enrollStudent(request.getCourseId()));
    }

    @GetMapping("/student/enrollments")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments() {
        return ResponseEntity.ok(enrollmentService.getMyEnrollments());
    }

    @GetMapping("/enrollments/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollmentList() {
        return ResponseEntity.ok(enrollmentService.getMyEnrollments());
    }

    @GetMapping("/mentor/courses/{courseId}/enrollments")
    public ResponseEntity<List<EnrollmentResponse>> getCourseEnrollments(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsForCourse(courseId));
    }

    @GetMapping("/admin/enrollments/course/{courseId}/count")
    public ResponseEntity<Long> getEnrollmentCount(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentCountForCourse(courseId));
    }

    @PutMapping("/student/enrollments/{enrollmentId}/progress")
    @Deprecated
    public ResponseEntity<EnrollmentResponse> updateProgress(
            @PathVariable Long enrollmentId,
            @RequestParam(required = false) Integer progress,
            @RequestParam(required = false) Integer lessonsCompleted
    ) {
        return ResponseEntity.ok(enrollmentService.updateProgress(enrollmentId, progress, lessonsCompleted));
    }

    @PostMapping("/student/lessons/{lessonId}/complete")
    public ResponseEntity<EnrollmentResponse> markLessonComplete(@PathVariable Long lessonId) {
        return ResponseEntity.ok(enrollmentService.markLessonComplete(lessonId));
    }

    @DeleteMapping("/student/lessons/{lessonId}/complete")
    public ResponseEntity<EnrollmentResponse> markLessonIncomplete(@PathVariable Long lessonId) {
        return ResponseEntity.ok(enrollmentService.markLessonIncomplete(lessonId));
    }

    @GetMapping("/student/courses/{courseId}/completed-lessons")
    public ResponseEntity<List<Long>> getCompletedLessonIds(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getCompletedLessonIdsForCourse(courseId));
    }

    @PostMapping("/student/enrollments/{enrollmentId}/notes")
    public ResponseEntity<EnrollmentResponse> saveNotes(@PathVariable Long enrollmentId, @RequestBody java.util.Map<String, String> body) {
        String notes = body != null ? body.get("notes") : "";
        return ResponseEntity.ok(enrollmentService.saveNotes(enrollmentId, notes));
    }

    @PostMapping("/student/enrollments/{enrollmentId}/bookmarks")
    public ResponseEntity<EnrollmentResponse> saveBookmarks(@PathVariable Long enrollmentId, @RequestBody java.util.Map<String, String> body) {
        String bookmarks = body != null ? body.get("bookmarks") : "";
        return ResponseEntity.ok(enrollmentService.saveBookmarks(enrollmentId, bookmarks));
    }

    @PutMapping("/student/enrollments/{enrollmentId}/last-opened/{lessonId}")
    public ResponseEntity<EnrollmentResponse> updateLastOpenedLesson(@PathVariable Long enrollmentId, @PathVariable Long lessonId) {
        return ResponseEntity.ok(enrollmentService.updateLastOpenedLesson(enrollmentId, lessonId));
    }
}
