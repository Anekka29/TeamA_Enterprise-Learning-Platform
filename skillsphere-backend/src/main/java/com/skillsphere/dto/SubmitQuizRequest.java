package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
public class SubmitQuizRequest {
    private Long quizId;
    private List<QuizSubmissionAnswerRequest> answers;

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public List<QuizSubmissionAnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(List<QuizSubmissionAnswerRequest> answers) {
        this.answers = answers;
    }
}
