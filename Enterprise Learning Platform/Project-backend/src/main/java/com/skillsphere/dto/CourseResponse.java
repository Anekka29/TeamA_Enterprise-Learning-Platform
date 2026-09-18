package com.skillsphere.dto;

import com.skillsphere.enums.CourseStatus;
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
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String shortDescription;
    private String category;
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
    private Long mentorId;
    private String mentorName;
    private String mentorEmail;
    private CourseStatus status;
    private String rejectionReason;
    private String reviewerName;
    private String reviewerEmail;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private Integer moduleCount;
    private Integer lessonCount;
    private Long enrollmentCount;
    private Boolean enrolled;
    private Long enrollmentId;
    private Double price;
}
