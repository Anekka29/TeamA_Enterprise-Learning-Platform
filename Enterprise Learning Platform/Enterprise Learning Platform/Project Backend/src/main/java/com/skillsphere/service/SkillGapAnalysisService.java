package com.skillsphere.service;

import com.skillsphere.dto.SkillGapAnalysisRequest;
import com.skillsphere.dto.SkillGapAnalysisResponse;

import java.util.List;

public interface SkillGapAnalysisService {
    SkillGapAnalysisResponse analyze(SkillGapAnalysisRequest request);
    List<SkillGapAnalysisResponse> getMyAnalyses();
}
