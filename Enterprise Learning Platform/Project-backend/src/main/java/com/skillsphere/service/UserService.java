package com.skillsphere.service;

import com.skillsphere.dto.*;

import java.util.List;

public interface UserService {
    UserResponse getCurrentUser();
    UserSettingsResponse getCurrentUserSettings();
    UserSettingsResponse updateSettings(UserSettingsRequest request);
    void changePassword(ChangePasswordRequest request);
    void updateEmail(UpdateEmailRequest request);
    List<LoginHistoryResponse> getLoginHistory();
    void logoutAllDevices();
    void deleteAccount();
}
