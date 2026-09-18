package com.skillsphere.controller;

import com.skillsphere.dto.AdminDashboardResponse;
import com.skillsphere.dto.MentorDashboardResponse;
import com.skillsphere.dto.StudentDashboardResponse;
import com.skillsphere.entity.User;
import com.skillsphere.exception.UserNotFoundException;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Authenticated user not found"));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentDashboardResponse> getStudentDashboard() {
        return ResponseEntity.ok(dashboardService.getStudentDashboard(getCurrentUser()));
    }

    @GetMapping("/mentor")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<MentorDashboardResponse> getMentorDashboard() {
        return ResponseEntity.ok(dashboardService.getMentorDashboard(getCurrentUser()));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard(getCurrentUser()));
    }
}
