package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIQuizGenerationResponse {
    private String title;
    private String description;
    private Integer timeLimitMinutes;
    private List<AIQuizQuestionResponse> questions;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTimeLimitMinutes() {
        return timeLimitMinutes;
    }

    public void setTimeLimitMinutes(Integer timeLimitMinutes) {
        this.timeLimitMinutes = timeLimitMinutes;
    }

    public List<AIQuizQuestionResponse> getQuestions() {
        return questions;
    }

    public void setQuestions(List<AIQuizQuestionResponse> questions) {
        this.questions = questions;
    }

    public static AIQuizGenerationResponseBuilder builder() {
        return new AIQuizGenerationResponseBuilder();
    }

    public static class AIQuizGenerationResponseBuilder {
        private String title;
        private String description;
        private Integer timeLimitMinutes;
        private List<AIQuizQuestionResponse> questions;

        AIQuizGenerationResponseBuilder() {}

        public AIQuizGenerationResponseBuilder title(String title) {
            this.title = title;
            return this;
        }

        public AIQuizGenerationResponseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public AIQuizGenerationResponseBuilder timeLimitMinutes(Integer timeLimitMinutes) {
            this.timeLimitMinutes = timeLimitMinutes;
            return this;
        }

        public AIQuizGenerationResponseBuilder questions(List<AIQuizQuestionResponse> questions) {
            this.questions = questions;
            return this;
        }

        public AIQuizGenerationResponse build() {
            return new AIQuizGenerationResponse(title, description, timeLimitMinutes, questions);
        }
    }
}
