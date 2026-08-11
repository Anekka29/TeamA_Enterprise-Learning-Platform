package com.skillsphere.service;

import com.skillsphere.dto.AdminDashboardResponse;
import com.skillsphere.dto.MentorDashboardResponse;
import com.skillsphere.dto.StudentDashboardResponse;
import com.skillsphere.entity.User;

public interface DashboardService {
    StudentDashboardResponse getStudentDashboard(User student);

    MentorDashboardResponse getMentorDashboard(User mentor);

    AdminDashboardResponse getAdminDashboard(User admin);
}
