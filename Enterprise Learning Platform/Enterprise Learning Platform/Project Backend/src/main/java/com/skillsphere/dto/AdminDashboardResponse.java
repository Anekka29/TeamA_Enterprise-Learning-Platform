package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {
    private String adminName;
    private Integer profileCompletionPercentage;
    private Integer totalUsers;
    private Integer students;
    private Integer mentors;
    private Integer admins;
    private Integer totalCourses;
    private Integer pendingCourseApprovals;
    private Integer activeCourses;
    private Integer complaints;
    private Integer reports;
    private List<DashboardActivityItem> auditLogs;
    private List<DashboardNotificationItem> notifications;
    private Long unreadNotificationCount;
}
