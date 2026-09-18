package com.skillsphere.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "internship_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "internship_id", nullable = false)
    private Internship internship;

    // Candidate Identity & Academic Info
    private String fullName;

    private String email;

    private String phone;

    private String college;

    private String graduationYear;

    private String currentCity;

    // Professional & Portfolio Links
    private String linkedInUrl;

    private String githubUrl;

    private String portfolioUrl;

    private String resumeUrl;

    // Cover Letter & Screening Answers
    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    @Column(columnDefinition = "TEXT")
    private String whyInterested;

    @Column(columnDefinition = "TEXT")
    private String relevantExperience;

    // Availability & Status
    private String startDate;

    private Boolean availabilityConfirmed;

    @Column(nullable = false)
    private String status; // "APPLIED", "UNDER_REVIEW", "SHORTLISTED", "ACCEPTED", "REJECTED"

    @Column(columnDefinition = "TEXT")
    private String reviewNotes;

    private LocalDateTime appliedAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (appliedAt == null) {
            appliedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "APPLIED";
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
