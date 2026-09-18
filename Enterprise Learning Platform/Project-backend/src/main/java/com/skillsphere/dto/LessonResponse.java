package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonResponse {
    private Long id;
    private Long moduleId;
    private String title;
    private String content;
    private Integer orderIndex;
    private String estimatedDuration;
    private String lessonType;
    private String videoUrl;
    private Boolean previewAvailable;
    private Boolean mandatory;
    private List<ResourceResponse> resources;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
