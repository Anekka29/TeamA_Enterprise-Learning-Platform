package com.skillsphere.service.impl;

import com.skillsphere.entity.AuditLog;
import com.skillsphere.repository.AuditLogRepository;
import com.skillsphere.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public void logAction(String action, String adminEmail, String targetUser, String targetCourse, String details, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .action(action)
                    .adminEmail(adminEmail != null ? adminEmail : "SYSTEM")
                    .targetUser(targetUser)
                    .targetCourse(targetCourse)
                    .details(details)
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .build();
            auditLogRepository.save(auditLog);
            log.info("Audit log recorded: {} by {}", action, adminEmail);
        } catch (Exception e) {
            log.error("Failed to record audit log: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }
}
