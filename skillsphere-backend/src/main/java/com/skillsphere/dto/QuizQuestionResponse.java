package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionResponse {
    private Long id;
    private String questionText;
    private Integer orderIndex;
    private Integer points;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctOption; // Only visible to mentor!

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getOptionA() {
        return optionA;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public String getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(String correctOption) {
        this.correctOption = correctOption;
    }

    public static QuizQuestionResponseBuilder builder() {
        return new QuizQuestionResponseBuilder();
    }

    public static class QuizQuestionResponseBuilder {
        private Long id;
        private String questionText;
        private Integer orderIndex;
        private Integer points;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctOption;

        QuizQuestionResponseBuilder() {
        }

        public QuizQuestionResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public QuizQuestionResponseBuilder questionText(String questionText) {
            this.questionText = questionText;
            return this;
        }

        public QuizQuestionResponseBuilder orderIndex(Integer orderIndex) {
            this.orderIndex = orderIndex;
            return this;
        }

        public QuizQuestionResponseBuilder points(Integer points) {
            this.points = points;
            return this;
        }

        public QuizQuestionResponseBuilder optionA(String optionA) {
            this.optionA = optionA;
            return this;
        }

        public QuizQuestionResponseBuilder optionB(String optionB) {
            this.optionB = optionB;
            return this;
        }

        public QuizQuestionResponseBuilder optionC(String optionC) {
            this.optionC = optionC;
            return this;
        }

        public QuizQuestionResponseBuilder optionD(String optionD) {
            this.optionD = optionD;
            return this;
        }

        public QuizQuestionResponseBuilder correctOption(String correctOption) {
            this.correctOption = correctOption;
            return this;
        }

        public QuizQuestionResponse build() {
            return new QuizQuestionResponse(id, questionText, orderIndex, points, optionA, optionB, optionC, optionD, correctOption);
        }
    }
}
