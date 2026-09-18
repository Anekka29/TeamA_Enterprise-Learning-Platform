package com.skillsphere.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private boolean emailNotifications = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean pushNotifications = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean inAppNotifications = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean profileVisible = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean courseProgressVisible = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean achievementsVisible = true;

    @Column(length = 20, nullable = false)
    @Builder.Default
    private String theme = "light";

    @Column(length = 10, nullable = false)
    @Builder.Default
    private String language = "en";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
