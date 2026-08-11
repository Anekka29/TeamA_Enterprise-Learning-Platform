package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettingsResponse {
    private Long id;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean inAppNotifications;
    private Boolean profileVisible;
    private Boolean courseProgressVisible;
    private Boolean achievementsVisible;
    private String theme;
    private String language;
}
