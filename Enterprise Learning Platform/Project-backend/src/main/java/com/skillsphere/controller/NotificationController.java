package com.skillsphere.controller;

import com.skillsphere.dto.NotificationResponse;
import com.skillsphere.entity.User;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.skillsphere.enums.Role;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getUserNotifications() {
        User user = getCurrentUser();
        return ResponseEntity.ok(notificationService.getUserNotifications(user));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications() {
        User user = getCurrentUser();
        return ResponseEntity.ok(notificationService.getUnreadNotifications(user));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount() {
        User user = getCurrentUser();
        return ResponseEntity.ok(notificationService.getUnreadCount(user));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        User user = getCurrentUser();
        notificationService.markAsRead(notificationId, user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        User user = getCurrentUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        User user = getCurrentUser();
        notificationService.deleteNotification(notificationId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Map<String, String>> broadcastNotification(@RequestBody Map<String, Object> request) {
        User user = getCurrentUser();
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.MENTOR) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String title = (String) request.get("title");
        String message = (String) request.get("message");
        String link = (String) request.get("link");
        String targetRole = (String) request.getOrDefault("targetRole", "ALL");
        Boolean sendEmail = (Boolean) request.getOrDefault("sendEmail", false);

        notificationService.broadcastNotification(title, message, link, targetRole, Boolean.TRUE.equals(sendEmail));
        return ResponseEntity.ok(Map.of("message", "Notification broadcasted successfully."));
    }
}
