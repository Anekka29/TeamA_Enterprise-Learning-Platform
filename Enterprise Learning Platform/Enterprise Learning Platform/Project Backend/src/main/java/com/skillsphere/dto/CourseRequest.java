package com.skillsphere.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String shortDescription;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Level is required")
    private String level;

    private String language;
    private String thumbnailUrl;
    private String bannerUrl;
    private String promotionalVideoUrl;
    private String introVideoUrl;
    private String estimatedDuration;
    private Integer estimatedLearningHours;
    private String prerequisites;
    private String targetAudience;
    private String learningOutcomes;
    private String skills;
    private Double averageRating;
    private Boolean certificateAvailable;
    private String tags;
    @jakarta.validation.constraints.Min(value = 0, message = "Price cannot be negative")
    private Double price;
}
