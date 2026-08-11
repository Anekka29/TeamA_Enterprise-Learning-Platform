package com.skillsphere.service.impl;

import com.skillsphere.dto.*;
import com.skillsphere.entity.*;
import com.skillsphere.exception.UserNotFoundException;
import com.skillsphere.repository.*;
import com.skillsphere.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final AdminProfileRepository adminProfileRepository;
    private final PasswordEncoder passwordEncoder;

    private User getCurrentUserEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public UserSettingsResponse getCurrentUserSettings() {
        User user = getCurrentUserEntity();
        UserSettings settings = userSettingsRepository.findByUser(user)
                .orElseGet(() -> UserSettings.builder().user(user).build());
        return mapToSettingsResponse(settings);
    }

    @Override
    @Transactional
    public UserSettingsResponse updateSettings(UserSettingsRequest request) {
        User user = getCurrentUserEntity();
        UserSettings settings = userSettingsRepository.findByUser(user)
                .orElseGet(() -> UserSettings.builder().user(user).build());

        if (request.getEmailNotifications() != null) {
            settings.setEmailNotifications(request.getEmailNotifications());
        }
        if (request.getPushNotifications() != null) {
            settings.setPushNotifications(request.getPushNotifications());
        }
        if (request.getInAppNotifications() != null) {
            settings.setInAppNotifications(request.getInAppNotifications());
        }
        if (request.getProfileVisible() != null) {
            settings.setProfileVisible(request.getProfileVisible());
        }
        if (request.getCourseProgressVisible() != null) {
            settings.setCourseProgressVisible(request.getCourseProgressVisible());
        }
        if (request.getAchievementsVisible() != null) {
            settings.setAchievementsVisible(request.getAchievementsVisible());
        }
        if (request.getTheme() != null) {
            settings.setTheme(request.getTheme());
        }
        if (request.getLanguage() != null) {
            settings.setLanguage(request.getLanguage());
        }

        UserSettings saved = userSettingsRepository.save(settings);
        return mapToSettingsResponse(saved);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUserEntity();
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateEmail(UpdateEmailRequest request) {
        User user = getCurrentUserEntity();
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Password is incorrect");
        }
        if (userRepository.existsByEmail(request.getNewEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        user.setEmail(request.getNewEmail());
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoginHistoryResponse> getLoginHistory() {
        User user = getCurrentUserEntity();
        List<LoginHistory> history = loginHistoryRepository.findTop50ByUserOrderByLoginAtDesc(user);
        return history.stream().map(this::mapToLoginHistoryResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void logoutAllDevices() {
        // For now, we'll just log this. To implement properly, we'd need to track active sessions
        // and invalidate JWT tokens (e.g., using a token blacklist)
        User user = getCurrentUserEntity();
        log.info("User {} requested logout from all devices", user.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        User user = getCurrentUserEntity();
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profileImage(user.getProfileImage())
                .profileCompleted(user.isProfileCompleted())
                .build();
    }

    @Override
    @Transactional
    public void deleteAccount() {
        User user = getCurrentUserEntity();
        
        // Delete role-specific profiles
        studentProfileRepository.findByUserId(user.getId()).ifPresent(studentProfileRepository::delete);
        mentorProfileRepository.findByUserId(user.getId()).ifPresent(mentorProfileRepository::delete);
        adminProfileRepository.findByUserId(user.getId()).ifPresent(adminProfileRepository::delete);
        
        // Delete settings
        userSettingsRepository.findByUser(user).ifPresent(userSettingsRepository::delete);
        
        // Delete user (which will cascade delete other related entities)
        userRepository.delete(user);
    }

    private UserSettingsResponse mapToSettingsResponse(UserSettings settings) {
        return UserSettingsResponse.builder()
                .id(settings.getId())
                .emailNotifications(settings.isEmailNotifications())
                .pushNotifications(settings.isPushNotifications())
                .inAppNotifications(settings.isInAppNotifications())
                .profileVisible(settings.isProfileVisible())
                .courseProgressVisible(settings.isCourseProgressVisible())
                .achievementsVisible(settings.isAchievementsVisible())
                .theme(settings.getTheme())
                .language(settings.getLanguage())
                .build();
    }

    private LoginHistoryResponse mapToLoginHistoryResponse(LoginHistory history) {
        return LoginHistoryResponse.builder()
                .id(history.getId())
                .ipAddress(history.getIpAddress())
                .userAgent(history.getUserAgent())
                .location(history.getLocation())
                .successful(history.isSuccessful())
                .loginAt(history.getLoginAt())
                .build();
    }
}
