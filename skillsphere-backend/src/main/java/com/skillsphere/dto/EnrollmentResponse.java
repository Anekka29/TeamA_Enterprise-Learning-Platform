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
public class EnrollmentResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private String courseCategory;
    private String courseLevel;
    private String courseDescription;
    private String mentorName;
    private String mentorEmail;
    private LocalDateTime enrolledAt;
    private Integer progress;
    private Integer lessonsCompleted;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentPhone;
    private Boolean certificateIssued;
    private Long lastOpenedLessonId;
    private LocalDateTime lastOpenedAt;
    private String notes;
    private String bookmarks;
}
