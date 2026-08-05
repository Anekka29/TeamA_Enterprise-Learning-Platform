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
public class RoadmapStage {
    private String title;
    private String description;
    private List<String> skills;
    private List<String> recommendedTopics;
    private String estimatedDuration;
    @Builder.Default
    private String status = "PENDING";
}
