package com.skillsphere.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(length = 20)
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 255)
    private String designation;

    @Column(length = 255)
    private String department;

    @Column(length = 255)
    private String organization;

    @Column(length = 100)
    private String adminIdentifier;

    @Column(length = 500)
    private String linkedinUrl;

    @Column(name = "updated_at", updatable = true)
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
