package com.skillsphere.dto;

import lombok.Data;

@Data
public class ComplaintUpdateRequest {
    private String status;
    private String assignedTo;
    private String resolutionNotes;
}
