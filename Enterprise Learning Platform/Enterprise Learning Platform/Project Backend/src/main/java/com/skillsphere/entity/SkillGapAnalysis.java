package com.skillsphere.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "skill_gap_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillGapAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String targetRole;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String currentSkillsJson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String requiredSkillsJson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String missingSkillsJson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String prioritySkillsJson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String recommendationsJson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String suggestedCoursesJson;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
