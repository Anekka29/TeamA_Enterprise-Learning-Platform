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
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardCourseItem {
    private Long id;
    private String title;
    private String category;
    private String level;
    private String mentorName;
    private String thumbnailUrl;
    private String shortDescription;
    private String estimatedDuration;
    private Integer estimatedLearningHours;
    private Integer progress;
    private Integer enrollmentCount;
    private CourseStatus status;
    private LocalDateTime updatedAt;
}
