package com.skillsphere.service;

import com.skillsphere.entity.SystemSettings;
import com.skillsphere.entity.User;

public interface SystemSettingsService {
    SystemSettings getSettings();
    SystemSettings updateSettings(SystemSettings request, User admin);
}
