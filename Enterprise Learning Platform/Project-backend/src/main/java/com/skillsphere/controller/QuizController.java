package com.skillsphere.controller;

import com.skillsphere.dto.*;
import com.skillsphere.entity.User;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Mentor endpoints
    @PostMapping("/mentor/courses/{courseId}/quizzes")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<QuizResponse> createQuiz(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateQuizRequest request
    ) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(quizService.createQuiz(courseId, request, mentor));
    }

    @PutMapping("/mentor/quizzes/{quizId}")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<QuizResponse> updateQuiz(
            @PathVariable Long quizId,
            @Valid @RequestBody CreateQuizRequest request
    ) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(quizService.updateQuiz(quizId, request, mentor));
    }

    @DeleteMapping("/mentor/quizzes/{quizId}")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId) {
        User mentor = getCurrentUser();
        quizService.deleteQuiz(quizId, mentor);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/mentor/quizzes/{quizId}/publish")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<QuizResponse> publishQuiz(@PathVariable Long quizId) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(quizService.publishQuiz(quizId, mentor));
    }

    @GetMapping("/mentor/courses/{courseId}/quizzes")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<List<QuizResponse>> getQuizzesByCourse(@PathVariable Long courseId) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(quizService.getQuizzesByCourse(courseId, mentor));
    }

    @GetMapping("/mentor/quizzes/{quizId}")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable Long quizId) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(quizService.getQuizById(quizId, mentor));
    }

    @PostMapping("/mentor/quizzes/generate")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<AIQuizGenerationResponse> generateQuiz(
            @Valid @RequestBody AIQuizGenerationRequest request
    ) {
        User mentor = getCurrentUser();
        return ResponseEntity.ok(quizService.generateQuiz(request, mentor));
    }

    // Student endpoints
    @GetMapping("/student/quizzes/{quizId}/attempt")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<QuizStudentResponse> getQuizForAttempt(@PathVariable Long quizId) {
        User student = getCurrentUser();
        return ResponseEntity.ok(quizService.getQuizForAttempt(quizId, student));
    }

    @PostMapping("/student/quizzes/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<QuizResultResponse> submitQuiz(@Valid @RequestBody SubmitQuizRequest request) {
        User student = getCurrentUser();
        return ResponseEntity.ok(quizService.submitQuiz(request, student));
    }

    @GetMapping("/student/quizzes/history")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<QuizResultResponse>> getStudentQuizHistory() {
        User student = getCurrentUser();
        return ResponseEntity.ok(quizService.getStudentQuizHistory(student));
    }

    @GetMapping("/student/quizzes/results/{resultId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<QuizResultResponse> getQuizResult(@PathVariable Long resultId) {
        User student = getCurrentUser();
        return ResponseEntity.ok(quizService.getQuizResult(resultId, student));
    }
}
