package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAnswerResponse {
    private Long questionId;
    private String questionText;
    private String selectedOption;
    private String correctOption;
    private Boolean isCorrect;
    private Integer pointsEarned;
    private Integer pointsPossible;
}
