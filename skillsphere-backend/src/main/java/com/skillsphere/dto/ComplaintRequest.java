package com.skillsphere.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ComplaintRequest {
    @NotBlank
    private String subject;
    @NotBlank
    private String description;
    private String category;
}
