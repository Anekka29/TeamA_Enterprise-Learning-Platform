package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningRoadmapResponse {
    private Long id;
    private String goal;
    private String estimatedDuration;
    private List<RoadmapStage> stages;
    private LocalDateTime createdAt;
}
