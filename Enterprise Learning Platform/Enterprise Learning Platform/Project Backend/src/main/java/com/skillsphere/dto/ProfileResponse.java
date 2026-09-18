package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {

    private String role;
    private Long userId;
    private String fullName;
    private String email;
    private String profileImage;
    private Integer profileCompletionPercentage;
    private Boolean profileCompleted;
    private List<String> missingRequiredFields;
    
    // Role-specific profile data
    private Object profileData;
}
