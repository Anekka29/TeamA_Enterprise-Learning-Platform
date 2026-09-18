package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDetailsResponse {
    private Long id;
    private String bannerUrl;
    private String thumbnailUrl;
    private String promotionalVideoUrl;
    private String introVideoUrl;
    private String title;
    private String shortDescription;
    private String description;
    private String instructor;
    private InstructorProfileResponse instructorProfile;
    private String learningOutcomes;
    private String prerequisites;
    private String skillsCovered;
    private String duration;
    private Integer estimatedLearningHours;
    private Integer lessonCount;
    private Integer moduleCount;
    private String difficulty;
    private String language;
    private String category;
    private Long enrollmentCount;
    private Double rating;
    private LocalDateTime lastUpdated;
    private Boolean certificateAvailable;
    private String tags;
    private Boolean enrolled;
    private Long enrollmentId;
    private Double price;
}
