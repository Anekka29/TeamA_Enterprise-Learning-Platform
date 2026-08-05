package com.skillsphere.dto;

import com.skillsphere.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String phoneNumber;
    private String college;
    private String department;
    private String year;
    private Role role;
    private boolean enabled;
    private String status; // "Active", "Suspended", "Deactivated"
    private String profileImage;
    private boolean profileCompleted;
    private Integer profileCompletionPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
