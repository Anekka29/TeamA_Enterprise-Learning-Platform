package com.skillsphere.controller;

import com.skillsphere.dto.*;
import com.skillsphere.service.ProfileService;
import com.skillsphere.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final ProfileService profileService;
    private final UserService userService;

    // Profile endpoints
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> getProfile() {
        ProfileResponse response = profileService.getCurrentUserProfile();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ProfileResponse> updateStudentProfile(@Valid @RequestBody StudentProfileRequest request) {
        ProfileResponse response = profileService.updateStudentProfile(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile/mentor")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<ProfileResponse> updateMentorProfile(@Valid @RequestBody MentorProfileRequest request) {
        ProfileResponse response = profileService.updateMentorProfile(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProfileResponse> updateAdminProfile(@Valid @RequestBody AdminProfileRequest request) {
        ProfileResponse response = profileService.updateAdminProfile(request);
        return ResponseEntity.ok(response);
    }

    // Settings endpoints
    @GetMapping("/settings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserSettingsResponse> getSettings() {
        return ResponseEntity.ok(userService.getCurrentUserSettings());
    }

    @PutMapping("/settings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserSettingsResponse> updateSettings(@Valid @RequestBody UserSettingsRequest request) {
        return ResponseEntity.ok(userService.updateSettings(request));
    }

    // Password and email endpoints
    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/update-email")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateEmail(@Valid @RequestBody UpdateEmailRequest request) {
        userService.updateEmail(request);
        return ResponseEntity.ok().build();
    }

    // Login history
    @GetMapping("/login-history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LoginHistoryResponse>> getLoginHistory() {
        return ResponseEntity.ok(userService.getLoginHistory());
    }

    // Logout all devices
    @PostMapping("/logout-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> logoutAllDevices() {
        userService.logoutAllDevices();
        return ResponseEntity.ok().build();
    }

    // Delete account
    @DeleteMapping("/delete-account")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteAccount() {
        userService.deleteAccount();
        return ResponseEntity.ok().build();
    }
}
