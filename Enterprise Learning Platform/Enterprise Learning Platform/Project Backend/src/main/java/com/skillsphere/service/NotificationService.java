package com.skillsphere.service;

import com.skillsphere.dto.NotificationResponse;
import com.skillsphere.entity.User;

import java.util.List;

public interface NotificationService {
    // Create notification
    void createNotification(User user, String title, String message, String link, boolean sendEmail);
    
    // Get notifications
    List<NotificationResponse> getUserNotifications(User user);
    List<NotificationResponse> getUnreadNotifications(User user);
    long getUnreadCount(User user);
    
    // Broadcast notification
    void broadcastNotification(String title, String message, String link, String targetRole, boolean sendEmail);
    
    // Mark as read & delete
    void markAsRead(Long notificationId, User user);
    void markAllAsRead(User user);
    void deleteNotification(Long notificationId, User user);
}
