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
public class QuizStudentResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private String title;
    private String description;
    private Integer timeLimitMinutes;
    private Integer totalPoints;
    private List<QuizStudentQuestionResponse> questions;

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

    public List<QuizStudentQuestionResponse> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuizStudentQuestionResponse> questions) {
        this.questions = questions;
    }

    public static QuizStudentResponseBuilder builder() {
        return new QuizStudentResponseBuilder();
    }

    public static class QuizStudentResponseBuilder {
        private Long id;
        private Long courseId;
        private String courseTitle;
        private String title;
        private String description;
        private Integer timeLimitMinutes;
        private Integer totalPoints;
        private List<QuizStudentQuestionResponse> questions;

        QuizStudentResponseBuilder() {
        }

        public QuizStudentResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public QuizStudentResponseBuilder courseId(Long courseId) {
            this.courseId = courseId;
            return this;
        }

        public QuizStudentResponseBuilder courseTitle(String courseTitle) {
            this.courseTitle = courseTitle;
            return this;
        }

        public QuizStudentResponseBuilder title(String title) {
            this.title = title;
            return this;
        }

        public QuizStudentResponseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public QuizStudentResponseBuilder timeLimitMinutes(Integer timeLimitMinutes) {
            this.timeLimitMinutes = timeLimitMinutes;
            return this;
        }

        public QuizStudentResponseBuilder totalPoints(Integer totalPoints) {
            this.totalPoints = totalPoints;
            return this;
        }

        public QuizStudentResponseBuilder questions(List<QuizStudentQuestionResponse> questions) {
            this.questions = questions;
            return this;
        }

        public QuizStudentResponse build() {
            return new QuizStudentResponse(id, courseId, courseTitle, title, description, timeLimitMinutes, totalPoints, questions);
        }
    }
}
