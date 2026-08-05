package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCourseReviewModule {
    private String title;
    private String description;
    private Integer orderIndex;
    private List<AdminCourseReviewLesson> lessons;
}
