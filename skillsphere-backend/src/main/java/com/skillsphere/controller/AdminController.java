package com.skillsphere.controller;

import com.skillsphere.dto.*;
import com.skillsphere.entity.AuditLog;
import com.skillsphere.entity.Course;
import com.skillsphere.entity.LoginHistory;
import com.skillsphere.entity.SystemSettings;
import com.skillsphere.entity.User;
import com.skillsphere.enums.CourseStatus;
import com.skillsphere.enums.Role;
import com.skillsphere.repository.*;
import com.skillsphere.service.AuditLogService;
import com.skillsphere.service.NotificationService;
import com.skillsphere.service.SystemSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final SystemSettingsService systemSettingsService;
    private final PasswordEncoder passwordEncoder;

    private User getAuthenticatedAdmin(Authentication authentication) {
        User admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only admins can access this endpoint");
        }
        return admin;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/details")
    public ResponseEntity<List<AdminUserResponse>> getAllUsersDetails() {
        List<User> users = userRepository.findAll();
        List<AdminUserResponse> responses = new ArrayList<>();

        for (User u : users) {
            LocalDateTime lastLogin = loginHistoryRepository.findFirstByUserOrderByLoginAtDesc(u)
                    .map(LoginHistory::getLoginAt)
                    .orElse(null);

            int completion = 50;
            if (u.isProfileCompleted()) completion += 30;
            if (u.getPhoneNumber() != null && !u.getPhoneNumber().isBlank()) completion += 10;
            if (u.getProfileImage() != null && !u.getProfileImage().isBlank()) completion += 10;

            String statusStr = u.isEnabled() ? "Active" : "Deactivated";

            responses.add(AdminUserResponse.builder()
                    .id(u.getId())
                    .fullName(u.getFullName())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .phoneNumber(u.getPhoneNumber())
                    .college(u.getCollege())
                    .department(u.getDepartment())
                    .year(u.getYear())
                    .role(u.getRole())
                    .enabled(u.isEnabled())
                    .status(statusStr)
                    .profileImage(u.getProfileImage())
                    .profileCompleted(u.isProfileCompleted())
                    .profileCompletionPercentage(completion)
                    .createdAt(u.getCreatedAt())
                    .lastLogin(lastLogin)
                    .build());
        }

        return ResponseEntity.ok(responses);
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateRoleRequest request,
            Authentication authentication
    ) {
        User admin = getAuthenticatedAdmin(authentication);
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (targetUser.getId().equals(admin.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Admins cannot change their own role"));
        }

        long adminCount = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).count();
        if (targetUser.getRole() == Role.ADMIN && request.getRole() != Role.ADMIN && adminCount <= 1) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot demote the last remaining Administrator"));
        }

        Role oldRole = targetUser.getRole();
        targetUser.setRole(request.getRole());
        userRepository.save(targetUser);

        auditLogService.logAction(
                "ROLE_CHANGE",
                admin.getEmail(),
                targetUser.getEmail(),
                null,
                "Role changed from " + oldRole + " to " + request.getRole(),
                null
        );

        try {
            notificationService.createNotification(
                    targetUser,
                    "Account Role Updated",
                    "Your role has been updated from " + oldRole + " to " + request.getRole() + " by administrator.",
                    "#roles",
                    true
            );
        } catch (Exception e) {
            log.error("Failed to dispatch role change notification", e);
        }

        return ResponseEntity.ok(Map.of(
                "message", "User role updated successfully",
                "userId", userId,
                "newRole", request.getRole()
        ));
    }

    @PutMapping("/users/bulk-role")
    public ResponseEntity<?> bulkUpdateUserRoles(
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        User admin = getAuthenticatedAdmin(authentication);

        List<?> userIdsRaw = (List<?>) body.get("userIds");
        String roleStr = (String) body.get("role");

        if (userIdsRaw == null || userIdsRaw.isEmpty() || roleStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User IDs list and target role are required"));
        }

        Role newRole;
        try {
            newRole = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid target role: " + roleStr));
        }

        List<Long> userIds = userIdsRaw.stream()
                .map(id -> Long.valueOf(id.toString()))
                .collect(Collectors.toList());

        long adminCount = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).count();
        int updatedCount = 0;

        for (Long userId : userIds) {
            if (userId.equals(admin.getId())) {
                continue;
            }
            Optional<User> targetOpt = userRepository.findById(userId);
            if (targetOpt.isEmpty()) continue;

            User targetUser = targetOpt.get();
            if (targetUser.getRole() == Role.ADMIN && newRole != Role.ADMIN && adminCount <= 1) {
                continue;
            }

            Role oldRole = targetUser.getRole();
            if (oldRole != newRole) {
                targetUser.setRole(newRole);
                userRepository.save(targetUser);
                updatedCount++;

                auditLogService.logAction(
                        "BULK_ROLE_CHANGE",
                        admin.getEmail(),
                        targetUser.getEmail(),
                        null,
                        "Bulk role update from " + oldRole + " to " + newRole,
                        null
                );

                try {
                    notificationService.createNotification(
                            targetUser,
                            "Account Role Updated",
                            "Your role has been updated to " + newRole + " by administrator.",
                            "#roles",
                            true
                    );
                } catch (Exception e) {
                    log.error("Failed to send notification for bulk role update", e);
                }
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", updatedCount + " user roles updated successfully",
                "updatedCount", updatedCount,
                "newRole", newRole
        ));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        User admin = getAuthenticatedAdmin(authentication);
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (targetUser.getId().equals(admin.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Admins cannot deactivate or suspend their own account"));
        }

        Boolean enabled = (Boolean) body.get("enabled");
        if (enabled == null && body.containsKey("status")) {
            String status = (String) body.get("status");
            enabled = "Active".equalsIgnoreCase(status);
        }

        if (enabled != null) {
            targetUser.setEnabled(enabled);
            userRepository.save(targetUser);

            String statusName = enabled ? "Activated" : "Deactivated";

            auditLogService.logAction(
                    "USER_STATUS_CHANGE",
                    admin.getEmail(),
                    targetUser.getEmail(),
                    null,
                    "User account status set to " + statusName,
                    null
            );

            try {
                notificationService.createNotification(
                        targetUser,
                        "Account Status Changed",
                        "Your account has been " + statusName.toLowerCase() + " by system administrator.",
                        "#settings",
                        true
                );
            } catch (Exception e) {
                log.error("Failed to send status notification", e);
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", "User status updated successfully",
                "userId", userId,
                "enabled", targetUser.isEnabled()
        ));
    }

    @PutMapping("/users/{userId}/reset-password")
    public ResponseEntity<?> resetUserPassword(
            @PathVariable Long userId,
            @Valid @RequestBody AdminResetPasswordRequest request,
            Authentication authentication
    ) {
        User admin = getAuthenticatedAdmin(authentication);
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        targetUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(targetUser);

        auditLogService.logAction(
                "RESET_PASSWORD",
                admin.getEmail(),
                targetUser.getEmail(),
                null,
                "Administrator reset password for user " + targetUser.getEmail(),
                null
        );

        try {
            notificationService.createNotification(
                    targetUser,
                    "Password Reset Notice",
                    "Your password has been reset by system administrator. Contact support if this was unauthorized.",
                    "#settings",
                    true
            );
        } catch (Exception e) {
            log.error("Failed to notify password reset", e);
        }

        return ResponseEntity.ok(Map.of("message", "Password reset successfully for user " + targetUser.getEmail()));
    }

    @PutMapping("/users/{userId}/edit")
    public ResponseEntity<?> editUserDetails(
            @PathVariable Long userId,
            @Valid @RequestBody AdminEditUserRequest request,
            Authentication authentication
    ) {
        User admin = getAuthenticatedAdmin(authentication);
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        targetUser.setFullName(request.getFullName());
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            targetUser.setUsername(request.getUsername());
        }
        targetUser.setEmail(request.getEmail());
        if (request.getPhoneNumber() != null) targetUser.setPhoneNumber(request.getPhoneNumber());
        if (request.getCollege() != null) targetUser.setCollege(request.getCollege());
        if (request.getDepartment() != null) targetUser.setDepartment(request.getDepartment());
        if (request.getYear() != null) targetUser.setYear(request.getYear());

        userRepository.save(targetUser);

        auditLogService.logAction(
                "EDIT_USER_PROFILE",
                admin.getEmail(),
                targetUser.getEmail(),
                null,
                "Administrator updated profile details for user " + targetUser.getEmail(),
                null
        );

        return ResponseEntity.ok(Map.of("message", "User details updated successfully"));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        User admin = getAuthenticatedAdmin(authentication);
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (targetUser.getId().equals(admin.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Admins cannot delete their own account"));
        }

        long adminCount = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).count();
        if (targetUser.getRole() == Role.ADMIN && adminCount <= 1) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete the last remaining Administrator account"));
        }

        String targetEmail = targetUser.getEmail();
        userRepository.delete(targetUser);

        auditLogService.logAction(
                "DELETE_USER",
                admin.getEmail(),
                targetEmail,
                null,
                "Deleted user account " + targetEmail,
                null
        );

        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogService.getAllAuditLogs());
    }

    @GetMapping("/settings")
    public ResponseEntity<SystemSettings> getSettings() {
        return ResponseEntity.ok(systemSettingsService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<SystemSettings> updateSettings(
            @RequestBody SystemSettings settings,
            Authentication authentication
    ) {
        User admin = getAuthenticatedAdmin(authentication);
        return ResponseEntity.ok(systemSettingsService.updateSettings(settings, admin));
    }

    @GetMapping("/analytics/details")
    public ResponseEntity<Map<String, Object>> getAnalyticsDetails() {
        long totalUsers = userRepository.count();
        long students = userRepository.findAll().stream().filter(u -> u.getRole() == Role.STUDENT).count();
        long mentors = userRepository.findAll().stream().filter(u -> u.getRole() == Role.MENTOR).count();
        long admins = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).count();

        long totalCourses = courseRepository.count();
        long approvedCourses = courseRepository.countByStatus(CourseStatus.APPROVED);
        long publishedCourses = courseRepository.countByStatus(CourseStatus.PUBLISHED);
        long pendingCourses = courseRepository.countByStatus(CourseStatus.SUBMITTED);
        long rejectedCourses = courseRepository.countByStatus(CourseStatus.REJECTED);

        long totalEnrollments = enrollmentRepository.count();

        Map<String, Integer> categoryDistribution = new HashMap<>();
        List<Course> courses = courseRepository.findAll();
        for (Course c : courses) {
            String cat = c.getCategory() != null ? c.getCategory() : "General";
            categoryDistribution.put(cat, categoryDistribution.getOrDefault(cat, 0) + 1);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers", totalUsers);
        data.put("students", students);
        data.put("mentors", mentors);
        data.put("admins", admins);
        data.put("totalCourses", totalCourses);
        data.put("approvedCourses", approvedCourses);
        data.put("publishedCourses", publishedCourses);
        data.put("pendingCourses", pendingCourses);
        data.put("rejectedCourses", rejectedCourses);
        data.put("totalEnrollments", totalEnrollments);
        data.put("categoryDistribution", categoryDistribution);

        return ResponseEntity.ok(data);
    }
}
