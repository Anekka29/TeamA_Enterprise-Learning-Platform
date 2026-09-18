package com.skillsphere.service;

import com.skillsphere.dto.LearningRoadmapResponse;

import java.util.List;

public interface LearningRoadmapService {
    LearningRoadmapResponse generateRoadmap();
    LearningRoadmapResponse generateRoadmap(String targetTopic);
    LearningRoadmapResponse improveRoadmap(Long roadmapId);
    List<LearningRoadmapResponse> getMyRoadmaps();
    LearningRoadmapResponse updateStageStatus(Long roadmapId, int stageIndex, String status);
}
