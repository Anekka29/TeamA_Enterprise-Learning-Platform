package com.skillsphere.service.impl;

import com.skillsphere.dto.*;
import com.skillsphere.entity.*;
import com.skillsphere.enums.Role;
import com.skillsphere.repository.*;
import com.skillsphere.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final AdminProfileRepository adminProfileRepository;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getCurrentUserProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return buildProfileResponse(user);
    }

    @Override
    @Transactional
    public ProfileResponse updateStudentProfile(StudentProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (!user.getRole().equals(Role.STUDENT)) {
            throw new IllegalArgumentException("Only students can update student profiles");
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getCollege() != null) {
            user.setCollege(request.getCollege());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }
        if (request.getCurrentYear() != null) {
            user.setYear(request.getCurrentYear());
        }
        userRepository.save(user);

        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElse(StudentProfile.builder().user(user).build());

        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setBio(request.getBio());
        profile.setCollege(request.getCollege());
        profile.setDegree(request.getDegree());
        profile.setDepartment(request.getDepartment());
        profile.setCurrentYear(request.getCurrentYear());
        profile.setGraduationYear(request.getGraduationYear());
        profile.setSkills(request.getSkills());
        profile.setInterests(request.getInterests());
        profile.setCareerGoal(request.getCareerGoal());
        profile.setPreferredLearningTopics(request.getPreferredLearningTopics());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setPortfolioUrl(request.getPortfolioUrl());

        studentProfileRepository.save(profile);

        // Update user profileCompleted flag
        ProfileResponse response = buildProfileResponse(user);
        user.setProfileCompleted(Boolean.TRUE.equals(response.getProfileCompleted()));
        userRepository.save(user);

        return response;
    }

    @Override
    @Transactional
    public ProfileResponse updateMentorProfile(MentorProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (!user.getRole().equals(Role.MENTOR)) {
            throw new IllegalArgumentException("Only mentors can update mentor profiles");
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getOrganization() != null) {
            user.setCollege(request.getOrganization());
        }
        userRepository.save(user);

        MentorProfile profile = mentorProfileRepository.findByUserId(user.getId())
                .orElse(MentorProfile.builder().user(user).build());

        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setProfessionalBio(request.getProfessionalBio());
        profile.setJobTitle(request.getJobTitle());
        profile.setOrganization(request.getOrganization());
        profile.setYearsOfExperience(request.getYearsOfExperience());
        profile.setExpertise(request.getExpertise());
        profile.setSkills(request.getSkills());
        profile.setSpecializations(request.getSpecializations());
        profile.setMentoringTopics(request.getMentoringTopics());
        profile.setMentoringExperience(request.getMentoringExperience());
        profile.setPreferredMentoringMode(request.getPreferredMentoringMode());
        profile.setAvailabilitySummary(request.getAvailabilitySummary());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setPortfolioUrl(request.getPortfolioUrl());
        profile.setCertifications(request.getCertifications());
        profile.setAchievements(request.getAchievements());

        mentorProfileRepository.save(profile);

        // Update user profileCompleted flag
        ProfileResponse response = buildProfileResponse(user);
        user.setProfileCompleted(Boolean.TRUE.equals(response.getProfileCompleted()));
        userRepository.save(user);

        return response;
    }

    @Override
    @Transactional
    public ProfileResponse updateAdminProfile(AdminProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (!user.getRole().equals(Role.ADMIN)) {
            throw new IllegalArgumentException("Only admins can update admin profiles");
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }
        userRepository.save(user);

        AdminProfile profile = adminProfileRepository.findByUserId(user.getId())
                .orElse(AdminProfile.builder().user(user).build());

        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setBio(request.getBio());
        profile.setDesignation(request.getDesignation());
        profile.setDepartment(request.getDepartment());
        profile.setOrganization(request.getOrganization());
        profile.setAdminIdentifier(request.getAdminIdentifier());
        profile.setLinkedinUrl(request.getLinkedinUrl());

        adminProfileRepository.save(profile);

        // Update user profileCompleted flag
        ProfileResponse response = buildProfileResponse(user);
        user.setProfileCompleted(Boolean.TRUE.equals(response.getProfileCompleted()));
        userRepository.save(user);

        return response;
    }

    private ProfileResponse buildProfileResponse(User user) {
        ProfileResponse.ProfileResponseBuilder builder = ProfileResponse.builder()
                .role(user.getRole().name())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage());

        switch (user.getRole()) {
            case STUDENT:
                return buildStudentProfileResponse(user, builder);
            case MENTOR:
                return buildMentorProfileResponse(user, builder);
            case ADMIN:
                return buildAdminProfileResponse(user, builder);
            default:
                throw new IllegalArgumentException("Unknown role: " + user.getRole());
        }
    }

    private ProfileResponse buildStudentProfileResponse(User user, ProfileResponse.ProfileResponseBuilder builder) {
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId()).orElse(null);

        // Student required fields: fullName, profileImage, phoneNumber, college, degree, department, currentYear, careerGoal
        List<String> requiredFields = Arrays.asList("fullName", "profileImage", "phoneNumber", "college", "degree", "department", "currentYear", "careerGoal");
        List<String> missingFields = new ArrayList<>();

        if (user.getFullName() == null || user.getFullName().trim().isEmpty()) missingFields.add("fullName");
        if (user.getProfileImage() == null || user.getProfileImage().trim().isEmpty()) missingFields.add("profileImage");
        
        if (profile != null) {
            if (profile.getPhoneNumber() == null || profile.getPhoneNumber().trim().isEmpty()) missingFields.add("phoneNumber");
            if (profile.getCollege() == null || profile.getCollege().trim().isEmpty()) missingFields.add("college");
            if (profile.getDegree() == null || profile.getDegree().trim().isEmpty()) missingFields.add("degree");
            if (profile.getDepartment() == null || profile.getDepartment().trim().isEmpty()) missingFields.add("department");
            if (profile.getCurrentYear() == null || profile.getCurrentYear().trim().isEmpty()) missingFields.add("currentYear");
            if (profile.getCareerGoal() == null || profile.getCareerGoal().trim().isEmpty()) missingFields.add("careerGoal");
            
            builder.profileData(profile);
        } else {
            missingFields.addAll(Arrays.asList("phoneNumber", "college", "degree", "department", "currentYear", "careerGoal"));
        }

        int completionPercentage = calculateCompletionPercentage(requiredFields.size(), missingFields.size());
        
        return builder
                .profileCompletionPercentage(completionPercentage)
                .profileCompleted(completionPercentage == 100)
                .missingRequiredFields(missingFields)
                .build();
    }

    private ProfileResponse buildMentorProfileResponse(User user, ProfileResponse.ProfileResponseBuilder builder) {
        MentorProfile profile = mentorProfileRepository.findByUserId(user.getId()).orElse(null);

        // Mentor required fields: fullName, profileImage, phoneNumber, professionalBio, jobTitle, organization, yearsOfExperience, expertise, mentoringTopics
        List<String> requiredFields = Arrays.asList("fullName", "profileImage", "phoneNumber", "professionalBio", "jobTitle", "organization", "yearsOfExperience", "expertise", "mentoringTopics");
        List<String> missingFields = new ArrayList<>();

        if (user.getFullName() == null || user.getFullName().trim().isEmpty()) missingFields.add("fullName");
        if (user.getProfileImage() == null || user.getProfileImage().trim().isEmpty()) missingFields.add("profileImage");
        
        if (profile != null) {
            if (profile.getPhoneNumber() == null || profile.getPhoneNumber().trim().isEmpty()) missingFields.add("phoneNumber");
            if (profile.getProfessionalBio() == null || profile.getProfessionalBio().trim().isEmpty()) missingFields.add("professionalBio");
            if (profile.getJobTitle() == null || profile.getJobTitle().trim().isEmpty()) missingFields.add("jobTitle");
            if (profile.getOrganization() == null || profile.getOrganization().trim().isEmpty()) missingFields.add("organization");
            if (profile.getYearsOfExperience() == null) missingFields.add("yearsOfExperience");
            if (profile.getExpertise() == null || profile.getExpertise().trim().isEmpty()) missingFields.add("expertise");
            if (profile.getMentoringTopics() == null || profile.getMentoringTopics().trim().isEmpty()) missingFields.add("mentoringTopics");
            
            builder.profileData(profile);
        } else {
            missingFields.addAll(Arrays.asList("phoneNumber", "professionalBio", "jobTitle", "organization", "yearsOfExperience", "expertise", "mentoringTopics"));
        }

        int completionPercentage = calculateCompletionPercentage(requiredFields.size(), missingFields.size());
        
        return builder
                .profileCompletionPercentage(completionPercentage)
                .profileCompleted(completionPercentage == 100)
                .missingRequiredFields(missingFields)
                .build();
    }

    private ProfileResponse buildAdminProfileResponse(User user, ProfileResponse.ProfileResponseBuilder builder) {
        AdminProfile profile = adminProfileRepository.findByUserId(user.getId()).orElse(null);

        // Admin required fields: fullName, profileImage, phoneNumber, designation, department, organization
        List<String> requiredFields = Arrays.asList("fullName", "profileImage", "phoneNumber", "designation", "department", "organization");
        List<String> missingFields = new ArrayList<>();

        if (user.getFullName() == null || user.getFullName().trim().isEmpty()) missingFields.add("fullName");
        if (user.getProfileImage() == null || user.getProfileImage().trim().isEmpty()) missingFields.add("profileImage");
        
        if (profile != null) {
            if (profile.getPhoneNumber() == null || profile.getPhoneNumber().trim().isEmpty()) missingFields.add("phoneNumber");
            if (profile.getDesignation() == null || profile.getDesignation().trim().isEmpty()) missingFields.add("designation");
            if (profile.getDepartment() == null || profile.getDepartment().trim().isEmpty()) missingFields.add("department");
            if (profile.getOrganization() == null || profile.getOrganization().trim().isEmpty()) missingFields.add("organization");
            
            builder.profileData(profile);
        } else {
            missingFields.addAll(Arrays.asList("phoneNumber", "designation", "department", "organization"));
        }

        int completionPercentage = calculateCompletionPercentage(requiredFields.size(), missingFields.size());
        
        return builder
                .profileCompletionPercentage(completionPercentage)
                .profileCompleted(completionPercentage == 100)
                .missingRequiredFields(missingFields)
                .build();
    }

    private int calculateCompletionPercentage(int totalRequired, int missingCount) {
        if (totalRequired == 0) return 100;
        int completed = totalRequired - missingCount;
        return (completed * 100) / totalRequired;
    }
}
