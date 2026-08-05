package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResultResponse {
    private Long id;
    private Long quizId;
    private String quizTitle;
    private Long studentId;
    private String studentName;
    private Integer score;
    private Integer totalPoints;
    private Integer percentage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private List<QuizAnswerResponse> answers;
}
