package com.skillsphere.service;

import com.skillsphere.dto.*;
import com.skillsphere.entity.User;

import java.util.List;

public interface QuizService {
    // Mentor endpoints
    QuizResponse createQuiz(Long courseId, CreateQuizRequest request, User mentor);
    QuizResponse updateQuiz(Long quizId, CreateQuizRequest request, User mentor);
    void deleteQuiz(Long quizId, User mentor);
    QuizResponse publishQuiz(Long quizId, User mentor);
    List<QuizResponse> getQuizzesByCourse(Long courseId, User mentor);
    QuizResponse getQuizById(Long quizId, User mentor);
    AIQuizGenerationResponse generateQuiz(AIQuizGenerationRequest request, User mentor);

    // Student endpoints
    QuizStudentResponse getQuizForAttempt(Long quizId, User student);
    QuizResultResponse submitQuiz(SubmitQuizRequest request, User student);
    List<QuizResultResponse> getStudentQuizHistory(User student);
    QuizResultResponse getQuizResult(Long resultId, User student);
}
