package com.skillsphere.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EnrollmentRequest {
    @NotNull(message = "Course ID is required")
    private Long courseId;
}
