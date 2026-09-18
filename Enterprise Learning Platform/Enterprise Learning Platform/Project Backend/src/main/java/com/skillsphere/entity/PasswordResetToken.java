package com.skillsphere.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String hashedToken;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean used = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getHashedToken() {
        return hashedToken;
    }

    public void setHashedToken(String hashedToken) {
        this.hashedToken = hashedToken;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }

    public static PasswordResetTokenBuilder builder() {
        return new PasswordResetTokenBuilder();
    }

    public static class PasswordResetTokenBuilder {
        private Long id;
        private User user;
        private String hashedToken;
        private LocalDateTime expiryTime;
        private LocalDateTime createdAt;
        private boolean used = false;

        PasswordResetTokenBuilder() {
        }

        public PasswordResetTokenBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PasswordResetTokenBuilder user(User user) {
            this.user = user;
            return this;
        }

        public PasswordResetTokenBuilder hashedToken(String hashedToken) {
            this.hashedToken = hashedToken;
            return this;
        }

        public PasswordResetTokenBuilder expiryTime(LocalDateTime expiryTime) {
            this.expiryTime = expiryTime;
            return this;
        }

        public PasswordResetTokenBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public PasswordResetTokenBuilder used(boolean used) {
            this.used = used;
            return this;
        }

        public PasswordResetToken build() {
            return new PasswordResetToken(id, user, hashedToken, expiryTime, createdAt, used);
        }
    }
}
