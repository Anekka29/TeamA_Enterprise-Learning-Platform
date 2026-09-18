package com.skillsphere.dto;

import com.skillsphere.entity.Complaint;
import com.skillsphere.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponse {

    private Long id;
    private StudentSummary student;
    private String subject;
    private String description;
    private String category;
    private String status;
    private String assignedTo;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentSummary {
        private Long id;
        private String fullName;
        private String email;
        private String username;
    }

    public static ComplaintResponse fromEntity(Complaint complaint) {
        if (complaint == null) return null;

        User s = complaint.getStudent();
        StudentSummary studentSummary = null;
        if (s != null) {
            studentSummary = StudentSummary.builder()
                    .id(s.getId())
                    .fullName(s.getFullName() != null ? s.getFullName() : s.getUsername())
                    .email(s.getEmail())
                    .username(s.getUsername())
                    .build();
        }

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .student(studentSummary)
                .subject(complaint.getSubject())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .status(complaint.getStatus())
                .assignedTo(complaint.getAssignedTo())
                .resolutionNotes(complaint.getResolutionNotes())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }
}
