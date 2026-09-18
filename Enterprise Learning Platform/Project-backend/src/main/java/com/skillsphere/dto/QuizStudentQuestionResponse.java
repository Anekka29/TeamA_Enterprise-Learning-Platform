package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizStudentQuestionResponse {
    private Long id;
    private String questionText;
    private Integer orderIndex;
    private Integer points;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    // No correct option here!

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

    public static QuizStudentQuestionResponseBuilder builder() {
        return new QuizStudentQuestionResponseBuilder();
    }

    public static class QuizStudentQuestionResponseBuilder {
        private Long id;
        private String questionText;
        private Integer orderIndex;
        private Integer points;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;

        QuizStudentQuestionResponseBuilder() {
        }

        public QuizStudentQuestionResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public QuizStudentQuestionResponseBuilder questionText(String questionText) {
            this.questionText = questionText;
            return this;
        }

        public QuizStudentQuestionResponseBuilder orderIndex(Integer orderIndex) {
            this.orderIndex = orderIndex;
            return this;
        }

        public QuizStudentQuestionResponseBuilder points(Integer points) {
            this.points = points;
            return this;
        }

        public QuizStudentQuestionResponseBuilder optionA(String optionA) {
            this.optionA = optionA;
            return this;
        }

        public QuizStudentQuestionResponseBuilder optionB(String optionB) {
            this.optionB = optionB;
            return this;
        }

        public QuizStudentQuestionResponseBuilder optionC(String optionC) {
            this.optionC = optionC;
            return this;
        }

        public QuizStudentQuestionResponseBuilder optionD(String optionD) {
            this.optionD = optionD;
            return this;
        }

        public QuizStudentQuestionResponse build() {
            return new QuizStudentQuestionResponse(id, questionText, orderIndex, points, optionA, optionB, optionC, optionD);
        }
    }
}
