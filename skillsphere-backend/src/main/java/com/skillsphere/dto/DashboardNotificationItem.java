package com.skillsphere.dto;

import com.skillsphere.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardNotificationItem {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private String link;
    private Boolean read;
    private LocalDateTime createdAt;
}
