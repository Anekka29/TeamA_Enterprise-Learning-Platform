package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssignmentRequest {
    private String title;
    private String instructions;
    private LocalDateTime dueDate;
}
