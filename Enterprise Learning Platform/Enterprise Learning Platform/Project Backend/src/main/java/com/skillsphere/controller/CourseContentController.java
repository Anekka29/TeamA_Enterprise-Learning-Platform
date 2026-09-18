package com.skillsphere.controller;

import com.skillsphere.dto.CourseModuleRequest;
import com.skillsphere.dto.CourseModuleResponse;
import com.skillsphere.dto.LessonRequest;
import com.skillsphere.dto.LessonResponse;
import com.skillsphere.dto.ResourceRequest;
import com.skillsphere.dto.ResourceResponse;
import com.skillsphere.entity.User;
import com.skillsphere.exception.UserNotFoundException;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.CourseContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourseContentController {

    private final CourseContentService courseContentService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Authenticated user not found"));
    }

    private User getCurrentUserOrNull() {
        org.springframework.security.core.Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    // ------------------------------
    // Course Module Endpoints
    // ------------------------------
    @GetMapping("/courses/{courseId}/modules")
    public ResponseEntity<List<CourseModuleResponse>> getModulesForCourse(@PathVariable Long courseId) {
        User user = getCurrentUserOrNull();
        return ResponseEntity.ok(courseContentService.getModulesForCourse(courseId, user));
    }

    @GetMapping("/courses/{courseId}/modules/{moduleId}")
    public ResponseEntity<CourseModuleResponse> getModuleById(@PathVariable Long courseId, @PathVariable Long moduleId) {
        User user = getCurrentUserOrNull();
        return ResponseEntity.ok(courseContentService.getModuleById(courseId, moduleId, user));
    }

    @PostMapping("/mentor/courses/{courseId}/modules")
    public ResponseEntity<CourseModuleResponse> createModule(
            @PathVariable Long courseId,
            @Valid @RequestBody CourseModuleRequest request
    ) {
        User mentor = getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(courseContentService.createModule(courseId, request, mentor));
    }

    @PutMapping("/mentor/courses/{courseId}/modules/{moduleId}")
    public ResponseEntity<CourseModuleResponse> updateModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @Valid @RequestBody CourseModuleRequest request
    ) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(courseContentService.updateModule(courseId, moduleId, request, mentor));
    }

    @DeleteMapping("/mentor/courses/{courseId}/modules/{moduleId}")
    public ResponseEntity<Void> deleteModule(@PathVariable Long courseId, @PathVariable Long moduleId) {
        User mentor = getCurrentUser();
        courseContentService.deleteModule(courseId, moduleId, mentor);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/mentor/courses/{courseId}/modules/reorder")
    public ResponseEntity<List<CourseModuleResponse>> reorderModules(
            @PathVariable Long courseId,
            @RequestBody List<Long> moduleIds
    ) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(courseContentService.reorderModules(courseId, moduleIds, mentor));
    }

    // ------------------------------
    // Lesson Endpoints
    // ------------------------------
    @GetMapping("/courses/{courseId}/modules/{moduleId}/lessons")
    public ResponseEntity<List<LessonResponse>> getLessonsForModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId
    ) {
        User user = getCurrentUserOrNull();
        return ResponseEntity.ok(courseContentService.getLessonsForModule(courseId, moduleId, user));
    }

    @GetMapping("/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}")
    public ResponseEntity<LessonResponse> getLessonById(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @PathVariable Long lessonId
    ) {
        User user = getCurrentUserOrNull();
        return ResponseEntity.ok(courseContentService.getLessonById(courseId, moduleId, lessonId, user));
    }

    @PostMapping("/mentor/courses/{courseId}/modules/{moduleId}/lessons")
    public ResponseEntity<LessonResponse> createLesson(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @Valid @RequestBody LessonRequest request
    ) {
        User mentor = getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseContentService.createLesson(courseId, moduleId, request, mentor));
    }

    @PutMapping("/mentor/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}")
    public ResponseEntity<LessonResponse> updateLesson(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonRequest request
    ) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(courseContentService.updateLesson(courseId, moduleId, lessonId, request, mentor));
    }

    @DeleteMapping("/mentor/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}")
    public ResponseEntity<Void> deleteLesson(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @PathVariable Long lessonId
    ) {
        User mentor = getCurrentUser();
        courseContentService.deleteLesson(courseId, moduleId, lessonId, mentor);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/mentor/courses/{courseId}/modules/{moduleId}/lessons/reorder")
    public ResponseEntity<List<LessonResponse>> reorderLessons(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @RequestBody List<Long> lessonIds
    ) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(courseContentService.reorderLessons(courseId, moduleId, lessonIds, mentor));
    }

    // ------------------------------
    // Resource Endpoints
    // ------------------------------
    @GetMapping("/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/resources")
    public ResponseEntity<List<ResourceResponse>> getResourcesForLesson(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @PathVariable Long lessonId
    ) {
        User user = getCurrentUserOrNull();
        return ResponseEntity.ok(courseContentService.getResourcesForLesson(courseId, moduleId, lessonId, user));
    }

    @GetMapping("/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/resources/{resourceId}")
    public ResponseEntity<ResourceResponse> getResourceById(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @PathVariable Long lessonId,
            @PathVariable Long resourceId
    ) {
        User user = getCurrentUserOrNull();
        return ResponseEntity.ok(courseContentService.getResourceById(courseId, moduleId, lessonId, resourceId, user));
    }

    @PostMapping("/mentor/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/resources")
    public ResponseEntity<ResourceResponse> createResource(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @PathVariable Long lessonId,
            @Valid @RequestBody ResourceRequest request
    ) {
        User mentor = getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseContentService.createResource(courseId, moduleId, lessonId, request, mentor));
    }

    @PutMapping("/mentor/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/resources/{resourceId}")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @PathVariable Long lessonId,
            @PathVariable Long resourceId,
            @Valid @RequestBody ResourceRequest request
    ) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(courseContentService.updateResource(courseId, moduleId, lessonId, resourceId, request, mentor));
    }

    @DeleteMapping("/mentor/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/resources/{resourceId}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @PathVariable Long lessonId,
            @PathVariable Long resourceId
    ) {
        User mentor = getCurrentUser();
        courseContentService.deleteResource(courseId, moduleId, lessonId, resourceId, mentor);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/mentor/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/resources/reorder")
    public ResponseEntity<List<ResourceResponse>> reorderResources(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @PathVariable Long lessonId,
            @RequestBody List<Long> resourceIds
    ) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(courseContentService.reorderResources(courseId, moduleId, lessonId, resourceIds, mentor));
    }
}
