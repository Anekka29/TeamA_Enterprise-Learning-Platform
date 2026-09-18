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
public class MentorProfileRequest {

    private String fullName;
    private String profileImage;
    private String phoneNumber;
    private String professionalBio;
    private String jobTitle;
    private String organization;
    private Integer yearsOfExperience;
    private String expertise;
    private String skills;
    private String specializations;
    private String mentoringTopics;
    private String mentoringExperience;
    private String preferredMentoringMode;
    private String availabilitySummary;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String certifications;
    private String achievements;

    public String getFullName() { return fullName; }
    public String getProfileImage() { return profileImage; }

    public String getPhoneNumber() { return phoneNumber; }
    public String getProfessionalBio() { return professionalBio; }
    public String getJobTitle() { return jobTitle; }
    public String getOrganization() { return organization; }
    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public String getExpertise() { return expertise; }
    public String getSkills() { return skills; }
    public String getSpecializations() { return specializations; }
    public String getMentoringTopics() { return mentoringTopics; }
    public String getMentoringExperience() { return mentoringExperience; }
    public String getPreferredMentoringMode() { return preferredMentoringMode; }
    public String getAvailabilitySummary() { return availabilitySummary; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public String getGithubUrl() { return githubUrl; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public String getCertifications() { return certifications; }
    public String getAchievements() { return achievements; }
}
