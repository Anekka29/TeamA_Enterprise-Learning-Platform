package com.skillsphere.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillGapAnalysisRequest {
    @NotBlank(message = "Target role is required")
    private String targetRole;
}
