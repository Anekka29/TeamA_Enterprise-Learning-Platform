package com.skillsphere.service.impl;

import com.skillsphere.entity.SystemSettings;
import com.skillsphere.entity.User;
import com.skillsphere.repository.SystemSettingsRepository;
import com.skillsphere.service.AuditLogService;
import com.skillsphere.service.SystemSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemSettingsServiceImpl implements SystemSettingsService {

    private final SystemSettingsRepository settingsRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public SystemSettings getSettings() {
        return settingsRepository.findById(1L).orElseGet(() -> {
            SystemSettings defaults = SystemSettings.builder()
                    .id(1L)
                    .platformName("SkillSphere Nexus")
                    .supportEmail("support@skillsphere.com")
                    .smtpHost("smtp.gmail.com")
                    .smtpPort(587)
                    .defaultLanguage("English")
                    .theme("System Dark")
                    .maintenanceMode(false)
                    .build();
            return settingsRepository.save(defaults);
        });
    }

    @Override
    @Transactional
    public SystemSettings updateSettings(SystemSettings request, User admin) {
        SystemSettings existing = getSettings();
        if (request.getPlatformName() != null) existing.setPlatformName(request.getPlatformName());
        if (request.getSupportEmail() != null) existing.setSupportEmail(request.getSupportEmail());
        if (request.getLogoUrl() != null) existing.setLogoUrl(request.getLogoUrl());
        if (request.getSmtpHost() != null) existing.setSmtpHost(request.getSmtpHost());
        if (request.getSmtpPort() != null) existing.setSmtpPort(request.getSmtpPort());
        if (request.getDefaultLanguage() != null) existing.setDefaultLanguage(request.getDefaultLanguage());
        if (request.getTheme() != null) existing.setTheme(request.getTheme());
        if (request.getMaintenanceMode() != null) existing.setMaintenanceMode(request.getMaintenanceMode());

        SystemSettings saved = settingsRepository.save(existing);

        auditLogService.logAction(
                "SYSTEM_SETTINGS_UPDATE",
                admin != null ? admin.getEmail() : "SYSTEM",
                null,
                null,
                "Updated system settings (Platform: " + saved.getPlatformName() + ", Maintenance: " + saved.getMaintenanceMode() + ")",
                null
        );

        return saved;
    }
}
