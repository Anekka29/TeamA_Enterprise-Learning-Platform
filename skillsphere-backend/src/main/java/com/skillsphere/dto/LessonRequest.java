package com.skillsphere.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LessonRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String content;

    @NotNull(message = "Order index is required")
    private Integer orderIndex;

    @Size(max = 100, message = "Estimated duration must not exceed 100 characters")
    private String estimatedDuration;

    @Pattern(
            regexp = "TEXT|VIDEO|DOCUMENT|QUIZ|ASSIGNMENT|LIVE_SESSION|PDF|READING|EXTERNAL_RESOURCE|EXTERNAL_LINK",
            message = "Lesson type must be one of: TEXT, VIDEO, DOCUMENT, QUIZ, ASSIGNMENT, LIVE_SESSION, PDF, READING, EXTERNAL_RESOURCE, EXTERNAL_LINK"
    )
    private String lessonType;

    @Size(max = 500, message = "Video URL must not exceed 500 characters")
    private String videoUrl;

    private Boolean previewAvailable;
    private Boolean mandatory;

    @AssertTrue(message = "Video URL is required when lesson type is VIDEO")
    public boolean isVideoUrlValidForLessonType() {
        return lessonType == null
                || !"VIDEO".equalsIgnoreCase(lessonType)
                || (videoUrl != null && !videoUrl.isBlank());
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public String getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(String estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }

    public String getLessonType() {
        return lessonType;
    }

    public void setLessonType(String lessonType) {
        this.lessonType = lessonType;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public Boolean getPreviewAvailable() {
        return previewAvailable;
    }

    public void setPreviewAvailable(Boolean previewAvailable) {
        this.previewAvailable = previewAvailable;
    }

    public Boolean getMandatory() {
        return mandatory;
    }

    public void setMandatory(Boolean mandatory) {
        this.mandatory = mandatory;
    }
}
