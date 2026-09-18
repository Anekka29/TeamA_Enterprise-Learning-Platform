package com.skillsphere.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminEditUserRequest {
    @NotBlank
    private String fullName;
    private String username;
    @NotBlank
    @Email
    private String email;
    private String phoneNumber;
    private String college;
    private String department;
    private String year;
}
