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
public class MentorDashboardResponse {
    private String mentorName;
    private Integer profileCompletionPercentage;
    private Integer coursesCreated;
    private Integer publishedCourses;
    private Integer draftCourses;
    private Integer totalStudents;
    private Integer totalEnrollments;
    private Integer pendingAssignments;
    private Integer pendingQuizzes;
    private List<DashboardActivityItem> recentStudentActivity;
    private List<DashboardSessionItem> upcomingSessions;
    private List<DashboardNotificationItem> notifications;
    private Long unreadNotificationCount;
}
