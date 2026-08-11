package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProfileRequest {

    private String fullName;
    private String profileImage;
    private String phoneNumber;
    private String bio;
    private String designation;
    private String department;
    private String organization;
    private String adminIdentifier;
    private String linkedinUrl;

    public String getFullName() { return fullName; }
    public String getProfileImage() { return profileImage; }

    public String getPhoneNumber() { return phoneNumber; }
    public String getBio() { return bio; }
    public String getDesignation() { return designation; }
    public String getDepartment() { return department; }
    public String getOrganization() { return organization; }
    public String getAdminIdentifier() { return adminIdentifier; }
    public String getLinkedinUrl() { return linkedinUrl; }
}
