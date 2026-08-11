package com.skillsphere.service;

import com.skillsphere.entity.AuditLog;

import java.util.List;

public interface AuditLogService {
    void logAction(String action, String adminEmail, String targetUser, String targetCourse, String details, String ipAddress);
    List<AuditLog> getAllAuditLogs();
}
