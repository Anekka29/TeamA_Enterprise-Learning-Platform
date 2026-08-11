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
public class StudentDashboardResponse {
    private String studentName;
    private Integer profileCompletionPercentage;
    private Integer activeEnrolledCourses;
    private Integer completedCourses;
    private Integer totalStudyHours;
    private Integer xpPoints;
    private Integer currentStreak;
    private Integer achievementsCount;
    private Integer certificatesCount;
    private Integer weeklyProgressPercentage;
    private Integer monthlyProgressPercentage;
    private Integer assignmentsPendingCount;
    private Integer quizzesPendingCount;
    private Integer mentorSessionsCount;
    private Integer upcomingDeadlinesCount;
    private Integer leaderboardRank;
    private DashboardCourseItem continueLearningCourse;
    private List<DashboardCourseItem> enrolledCourses;
    private List<DashboardCourseItem> recommendedCourses;
    private List<DashboardAchievementItem> recentAchievements;
    private List<DashboardSessionItem> upcomingSessions;
    private List<DashboardNotificationItem> notifications;
    private Long unreadNotificationCount;
    private List<LeaderboardItem> leaderboardStandings;
}
