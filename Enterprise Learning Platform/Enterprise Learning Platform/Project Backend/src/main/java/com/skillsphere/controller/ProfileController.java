package com.skillsphere.controller;

import com.skillsphere.dto.AdminProfileRequest;
import com.skillsphere.dto.MentorProfileRequest;
import com.skillsphere.dto.ProfileResponse;
import com.skillsphere.dto.StudentProfileRequest;
import com.skillsphere.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * Get current authenticated user's profile
     * Returns role-specific profile data with completion percentage
     */
    @GetMapping({"", "/me"})
    public ResponseEntity<ProfileResponse> getCurrentUserProfile() {
        ProfileResponse response = profileService.getCurrentUserProfile();
        return ResponseEntity.ok(response);
    }

    /**
     * Update student profile
     * Only accessible by users with STUDENT role
     */
    @PutMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ProfileResponse> updateStudentProfile(
            @Valid @RequestBody StudentProfileRequest request) {
        ProfileResponse response = profileService.updateStudentProfile(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Update mentor profile
     * Only accessible by users with MENTOR role
     */
    @PutMapping("/mentor")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<ProfileResponse> updateMentorProfile(
            @Valid @RequestBody MentorProfileRequest request) {
        ProfileResponse response = profileService.updateMentorProfile(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Update admin profile
     * Only accessible by users with ADMIN role
     */
    @PutMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProfileResponse> updateAdminProfile(
            @Valid @RequestBody AdminProfileRequest request) {
        ProfileResponse response = profileService.updateAdminProfile(request);
        return ResponseEntity.ok(response);
    }
}
