package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private String title;
    private String description;
    private Integer timeLimitMinutes;
    private Integer totalPoints;
    private Boolean published;
    private List<QuizQuestionResponse> questions;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }

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

    public Integer getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(Integer totalPoints) {
        this.totalPoints = totalPoints;
    }

    public Boolean getPublished() {
        return published;
    }

    public void setPublished(Boolean published) {
        this.published = published;
    }

    public List<QuizQuestionResponse> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuizQuestionResponse> questions) {
        this.questions = questions;
    }

    public static QuizResponseBuilder builder() {
        return new QuizResponseBuilder();
    }

    public static class QuizResponseBuilder {
        private Long id;
        private Long courseId;
        private String courseTitle;
        private String title;
        private String description;
        private Integer timeLimitMinutes;
        private Integer totalPoints;
        private Boolean published;
        private List<QuizQuestionResponse> questions;

        QuizResponseBuilder() {
        }

        public QuizResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public QuizResponseBuilder courseId(Long courseId) {
            this.courseId = courseId;
            return this;
        }

        public QuizResponseBuilder courseTitle(String courseTitle) {
            this.courseTitle = courseTitle;
            return this;
        }

        public QuizResponseBuilder title(String title) {
            this.title = title;
            return this;
        }

        public QuizResponseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public QuizResponseBuilder timeLimitMinutes(Integer timeLimitMinutes) {
            this.timeLimitMinutes = timeLimitMinutes;
            return this;
        }

        public QuizResponseBuilder totalPoints(Integer totalPoints) {
            this.totalPoints = totalPoints;
            return this;
        }

        public QuizResponseBuilder published(Boolean published) {
            this.published = published;
            return this;
        }

        public QuizResponseBuilder questions(List<QuizQuestionResponse> questions) {
            this.questions = questions;
            return this;
        }

        public QuizResponse build() {
            return new QuizResponse(id, courseId, courseTitle, title, description, timeLimitMinutes, totalPoints, published, questions);
        }
    }
}
