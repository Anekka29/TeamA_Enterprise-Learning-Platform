package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIQuizQuestionResponse {
    private String question;
    private List<String> options;
    private String correctAnswer;
    private String explanation;
    private String difficulty;
    private Integer points;

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public static AIQuizQuestionResponseBuilder builder() {
        return new AIQuizQuestionResponseBuilder();
    }

    public static class AIQuizQuestionResponseBuilder {
        private String question;
        private List<String> options;
        private String correctAnswer;
        private String explanation;
        private String difficulty;
        private Integer points;

        AIQuizQuestionResponseBuilder() {}

        public AIQuizQuestionResponseBuilder question(String question) {
            this.question = question;
            return this;
        }

        public AIQuizQuestionResponseBuilder options(List<String> options) {
            this.options = options;
            return this;
        }

        public AIQuizQuestionResponseBuilder correctAnswer(String correctAnswer) {
            this.correctAnswer = correctAnswer;
            return this;
        }

        public AIQuizQuestionResponseBuilder explanation(String explanation) {
            this.explanation = explanation;
            return this;
        }

        public AIQuizQuestionResponseBuilder difficulty(String difficulty) {
            this.difficulty = difficulty;
            return this;
        }

        public AIQuizQuestionResponseBuilder points(Integer points) {
            this.points = points;
            return this;
        }

        public AIQuizQuestionResponse build() {
            return new AIQuizQuestionResponse(question, options, correctAnswer, explanation, difficulty, points);
        }
    }
}
