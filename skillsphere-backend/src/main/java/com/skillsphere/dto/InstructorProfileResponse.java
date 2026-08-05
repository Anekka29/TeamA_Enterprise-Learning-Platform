package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String department;
    private String college;
    private String profileImage;
}
