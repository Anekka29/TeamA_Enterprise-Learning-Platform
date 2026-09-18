package com.skillsphere.controller;

import com.skillsphere.dto.SkillGapAnalysisRequest;
import com.skillsphere.dto.SkillGapAnalysisResponse;
import com.skillsphere.service.SkillGapAnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-gap")
@RequiredArgsConstructor
public class SkillGapAnalysisController {

    private final SkillGapAnalysisService skillGapAnalysisService;

    @PostMapping("/analyze")
    public ResponseEntity<SkillGapAnalysisResponse> analyze(@Valid @RequestBody SkillGapAnalysisRequest request) {
        SkillGapAnalysisResponse response = skillGapAnalysisService.analyze(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<SkillGapAnalysisResponse>> getMyAnalyses() {
        List<SkillGapAnalysisResponse> analyses = skillGapAnalysisService.getMyAnalyses();
        return ResponseEntity.ok(analyses);
    }
}
