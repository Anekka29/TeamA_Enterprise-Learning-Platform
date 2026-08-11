package com.skillsphere.entity;

import com.skillsphere.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "internships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    private String companyLogo;

    private String category; // e.g. "Frontend", "Backend", "AI/ML", "UI/UX", "Full-Stack"

    private String locationType; // "Remote", "Hybrid", "On-Site"

    private String locationCity;

    private Double stipendMin;

    private Double stipendMax;

    private Integer durationMonths;

    private String icon;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> responsibilities;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> requiredSkills;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> perks;

    private String deadline;

    private Integer openingsCount;

    private Long postedByUserId;

    private String postedByName;

    @Builder.Default
    private boolean active = true;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
