package com.skillsphere.controller;

import com.skillsphere.dto.LearningRoadmapResponse;
import com.skillsphere.service.LearningRoadmapService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roadmaps")
@RequiredArgsConstructor
@Slf4j
public class LearningRoadmapController {

    private final LearningRoadmapService learningRoadmapService;

    @PostMapping("/generate")
    public ResponseEntity<LearningRoadmapResponse> generateRoadmap(@RequestBody(required = false) java.util.Map<String, String> body) {
        String topic = (body != null && body.containsKey("topic")) ? body.get("topic") : null;
        log.info("REST request received: POST /api/roadmaps/generate with topic='{}'", topic);
        LearningRoadmapResponse response = learningRoadmapService.generateRoadmap(topic);
        log.info("REST response returned successfully for POST /api/roadmaps/generate - Roadmap ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/improve")
    public ResponseEntity<LearningRoadmapResponse> improveRoadmap(@PathVariable Long id) {
        log.info("REST request received: POST /api/roadmaps/{}/improve", id);
        LearningRoadmapResponse response = learningRoadmapService.improveRoadmap(id);
        log.info("REST response returned successfully for POST /api/roadmaps/{}/improve - New Roadmap ID: {}", id, response.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<LearningRoadmapResponse>> getMyRoadmaps() {
        log.info("REST request received: GET /api/roadmaps");
        List<LearningRoadmapResponse> roadmaps = learningRoadmapService.getMyRoadmaps();
        log.info("REST response returned successfully for GET /api/roadmaps - Count: {}", roadmaps.size());
        return ResponseEntity.ok(roadmaps);
    }

    @PutMapping("/{id}/stages/{stageIndex}/status")
    public ResponseEntity<LearningRoadmapResponse> updateStageStatus(
            @PathVariable Long id,
            @PathVariable int stageIndex,
            @RequestBody java.util.Map<String, String> body) {
        String status = body.getOrDefault("status", "PENDING");
        log.info("REST request received: PUT /api/roadmaps/{}/stages/{}/status with status={}", id, stageIndex, status);
        LearningRoadmapResponse response = learningRoadmapService.updateStageStatus(id, stageIndex, status);
        log.info("REST response returned successfully for PUT /api/roadmaps/{}/stages/{}/status", id, stageIndex);
        return ResponseEntity.ok(response);
    }
}
