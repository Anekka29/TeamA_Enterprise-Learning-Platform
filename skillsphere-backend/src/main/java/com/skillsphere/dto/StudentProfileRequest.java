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
public class StudentProfileRequest {

    private String fullName;
    private String profileImage;
    private String phoneNumber;
    private String bio;
    private String college;
    private String degree;
    private String department;
    private String currentYear;
    private Integer graduationYear;
    private String skills;
    private String interests;
    private String careerGoal;
    private String preferredLearningTopics;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;

    public String getFullName() { return fullName; }
    public String getProfileImage() { return profileImage; }

    public String getPhoneNumber() { return phoneNumber; }
    public String getBio() { return bio; }
    public String getCollege() { return college; }
    public String getDegree() { return degree; }
    public String getDepartment() { return department; }
    public String getCurrentYear() { return currentYear; }
    public Integer getGraduationYear() { return graduationYear; }
    public String getSkills() { return skills; }
    public String getInterests() { return interests; }
    public String getCareerGoal() { return careerGoal; }
    public String getPreferredLearningTopics() { return preferredLearningTopics; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public String getGithubUrl() { return githubUrl; }
    public String getPortfolioUrl() { return portfolioUrl; }
}
