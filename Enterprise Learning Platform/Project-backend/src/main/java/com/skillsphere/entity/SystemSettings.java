package com.skillsphere.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettings {

    @Id
    @Builder.Default
    private Long id = 1L;

    @Column(nullable = false)
    @Builder.Default
    private String platformName = "Enterprise Learning Platform with Skill and Career Guidance System";

    @Column(nullable = false)
    @Builder.Default
    private String supportEmail = "support@skillsphere.com";

    @Column
    private String logoUrl;

    @Column
    @Builder.Default
    private String smtpHost = "smtp.gmail.com";

    @Column
    @Builder.Default
    private Integer smtpPort = 587;

    @Column
    @Builder.Default
    private String defaultLanguage = "English";

    @Column
    @Builder.Default
    private String theme = "System Dark";

    @Column
    @Builder.Default
    private Boolean maintenanceMode = false;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }
}
