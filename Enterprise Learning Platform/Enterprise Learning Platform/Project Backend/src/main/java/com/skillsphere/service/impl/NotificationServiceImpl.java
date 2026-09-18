package com.skillsphere.service.impl;

import com.skillsphere.dto.NotificationResponse;
import com.skillsphere.entity.Notification;
import com.skillsphere.entity.User;
import com.skillsphere.enums.NotificationType;
import com.skillsphere.repository.NotificationRepository;
import com.skillsphere.service.EmailService;
import com.skillsphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.skillsphere.enums.Role;
import com.skillsphere.repository.UserRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public void createNotification(User user, String title, String message, String link, boolean sendEmail) {
        Notification notification = Notification.builder()
                .user(user)
                .type(NotificationType.ANNOUNCEMENT) // Default type, can be overridden
                .title(title)
                .message(message)
                .link(link)
                .read(false)
                .emailSent(false)
                .build();

        notification = notificationRepository.save(notification);

        // Send email only for important events
        if (sendEmail && user.getEmail() != null) {
            try {
                sendNotificationEmail(user, title, message, link);
                notification.setEmailSent(true);
                notificationRepository.save(notification);
                log.info("Email sent for notification to user: {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send notification email to user: {}", user.getEmail(), e);
                // Don't fail the notification if email fails
            }
        }
    }

    @Override
    @Transactional
    public void broadcastNotification(String title, String message, String link, String targetRole, boolean sendEmail) {
        List<User> targetUsers;
        if ("STUDENT".equalsIgnoreCase(targetRole)) {
            targetUsers = userRepository.findByRole(Role.STUDENT);
        } else if ("MENTOR".equalsIgnoreCase(targetRole)) {
            targetUsers = userRepository.findByRole(Role.MENTOR);
        } else {
            targetUsers = userRepository.findAll();
        }

        for (User user : targetUsers) {
            createNotification(user, title, message, link, sendEmail);
        }
        log.info("Broadcasted notification '{}' to {} users (target: {})", title, targetUsers.size(), targetRole);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only mark your own notifications as read");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user);
        unreadNotifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own notifications");
        }

        notificationRepository.delete(notification);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .link(notification.getLink())
                .read(notification.getRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private void sendNotificationEmail(User user, String title, String message, String link) {
        // Simple email notification - can be enhanced with HTML templates
        String emailBody = String.format(
                "Hello %s,\n\n%s\n\n%s\n\n%s\n\nBest regards,\nSkillSphere Nexus Team",
                user.getFullName() != null ? user.getFullName() : user.getEmail(),
                title,
                message,
                link != null ? "Click here to view: " + link : ""
        );
        
        // For now, we'll log the email since EmailService only has password reset method
        // In production, you would add a generic sendEmail method to EmailService
        log.info("Sending notification email to {}: {}", user.getEmail(), emailBody);
    }
}
