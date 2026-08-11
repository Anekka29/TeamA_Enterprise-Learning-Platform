package com.skillsphere.controller;

import com.skillsphere.dto.AdminCourseReviewResponse;
import com.skillsphere.dto.CourseDetailsResponse;
import com.skillsphere.dto.CourseRequest;
import com.skillsphere.dto.CourseResponse;
import com.skillsphere.dto.RejectCourseRequest;
import com.skillsphere.entity.User;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new com.skillsphere.exception.UserNotFoundException("Authenticated user not found"));
    }

    // Student & Guest Public endpoints
    @GetMapping({"/courses", "/student/courses", "/public/courses"})
    public ResponseEntity<List<CourseResponse>> getPublishedCourses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category
    ) {
        List<CourseResponse> courses;
        if (search != null || category != null) {
            courses = courseService.searchPublishedCourses(search, category);
        } else {
            courses = courseService.getPublishedCourses();
        }
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/student/courses/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<CourseDetailsResponse> getCourseDetailsById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseDetailsById(id));
    }

    // Mentor endpoints
    @GetMapping("/mentor/courses")
    public ResponseEntity<List<CourseResponse>> getMentorCourses() {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(courseService.getMentorCourses(mentor));
    }

    @GetMapping("/mentor/courses/{id}")
    public ResponseEntity<CourseResponse> getMentorCourseById(@PathVariable Long id) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(courseService.getMentorCourseById(id, mentor));
    }

    @PostMapping("/mentor/courses")
    public ResponseEntity<CourseResponse> createDraftCourse(@Valid @RequestBody CourseRequest request) {
        User mentor = getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createDraftCourse(request, mentor));
    }

    @PutMapping("/mentor/courses/{id}")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request
    ) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(courseService.updateCourse(id, request, mentor));
    }

    @DeleteMapping({"/mentor/courses/{id}", "/courses/{id}", "/admin/courses/{id}"})
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        User user = getCurrentUser();
        courseService.deleteDraftCourse(id, user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping({"/mentor/courses/{id}/submit", "/courses/{id}/submit"})
    public ResponseEntity<CourseResponse> submitForApproval(@PathVariable Long id) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(courseService.submitForApproval(id, mentor));
    }

    @PostMapping("/courses/{id}/submit")
    public ResponseEntity<CourseResponse> submitForApprovalPost(@PathVariable Long id) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(courseService.submitForApproval(id, mentor));
    }

    @PutMapping("/mentor/courses/{id}/publish")
    public ResponseEntity<CourseResponse> publishCourse(@PathVariable Long id) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(courseService.publishCourse(id, mentor));
    }

    @PutMapping("/mentor/courses/{id}/withdraw")
    public ResponseEntity<CourseResponse> withdrawSubmission(@PathVariable Long id) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(courseService.withdrawSubmission(id, mentor));
    }

    @PostMapping("/mentor/courses/{id}/duplicate")
    public ResponseEntity<CourseResponse> duplicateCourse(@PathVariable Long id) {
        User mentor = getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.duplicateCourse(id, mentor));
    }

    // Admin endpoints
    @GetMapping({"/admin/courses/pending", "/courses/pending"})
    public ResponseEntity<List<CourseResponse>> getPendingCourses() {
        return ResponseEntity.ok(courseService.getPendingApprovalCourses());
    }

    @GetMapping("/courses/approved")
    public ResponseEntity<List<CourseResponse>> getApprovedCourses() {
        return ResponseEntity.ok(courseService.getCoursesByStatus(com.skillsphere.enums.CourseStatus.APPROVED));
    }

    @GetMapping("/courses/rejected")
    public ResponseEntity<List<CourseResponse>> getRejectedCourses() {
        return ResponseEntity.ok(courseService.getCoursesByStatus(com.skillsphere.enums.CourseStatus.REJECTED));
    }

    @GetMapping("/courses/published")
    public ResponseEntity<List<CourseResponse>> getPublishedCoursesAlias() {
        return ResponseEntity.ok(courseService.getPublishedCourses());
    }

    @GetMapping("/admin/courses/status/{status}")
    public ResponseEntity<List<CourseResponse>> getCoursesByStatus(@PathVariable com.skillsphere.enums.CourseStatus status) {
        return ResponseEntity.ok(courseService.getCoursesByStatus(status));
    }

    @GetMapping("/admin/courses/{id}")
    public ResponseEntity<AdminCourseReviewResponse> getAdminCourseReviewById(@PathVariable Long id) {
        User admin = getCurrentUser();
        return ResponseEntity.ok(courseService.getAdminCourseReviewById(id, admin));
    }

    @PutMapping({"/admin/courses/{id}/approve", "/courses/{id}/approve"})
    public ResponseEntity<CourseResponse> approveCourse(@PathVariable Long id) {
        User admin = getCurrentUser();
        return ResponseEntity.ok(courseService.approveCourse(id, admin));
    }

    @PutMapping({"/admin/courses/{id}/reject", "/courses/{id}/reject"})
    public ResponseEntity<CourseResponse> rejectCourse(
            @PathVariable Long id,
            @Valid @RequestBody RejectCourseRequest request
    ) {
        User admin = getCurrentUser();
        return ResponseEntity.ok(courseService.rejectCourse(id, request.getReason(), admin));
    }

    @PutMapping("/admin/courses/{id}/request-changes")
    public ResponseEntity<CourseResponse> requestChanges(
            @PathVariable Long id,
            @Valid @RequestBody RejectCourseRequest request
    ) {
        User admin = getCurrentUser();
        return ResponseEntity.ok(courseService.requestChanges(id, request.getReason(), admin));
    }

    @PutMapping("/admin/courses/{id}/publish")
    public ResponseEntity<CourseResponse> publishCourseAsAdmin(@PathVariable Long id) {
        User admin = getCurrentUser();
        return ResponseEntity.ok(courseService.publishCourseAsAdmin(id, admin));
    }

    @PutMapping("/admin/courses/{id}/archive")
    public ResponseEntity<CourseResponse> archiveCourse(@PathVariable Long id) {
        User admin = getCurrentUser();
        return ResponseEntity.ok(courseService.archiveCourse(id, admin));
    }
}
