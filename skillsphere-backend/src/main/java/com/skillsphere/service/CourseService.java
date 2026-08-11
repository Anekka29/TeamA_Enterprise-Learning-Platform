package com.skillsphere.service;

import com.skillsphere.dto.CourseRequest;
import com.skillsphere.dto.CourseDetailsResponse;
import com.skillsphere.dto.CourseResponse;
import com.skillsphere.dto.AdminCourseReviewResponse;
import com.skillsphere.entity.User;
import java.util.List;

public interface CourseService {
    CourseResponse createDraftCourse(CourseRequest request, User mentor);
    CourseResponse getMentorCourseById(Long id, User mentor);
    CourseResponse updateCourse(Long id, CourseRequest request, User mentor);
    void deleteDraftCourse(Long id, User mentor);
    CourseResponse submitForApproval(Long id, User mentor);
    CourseResponse publishCourse(Long id, User mentor);
    CourseResponse withdrawSubmission(Long id, User mentor);
    CourseResponse duplicateCourse(Long id, User mentor);
    List<CourseResponse> getMentorCourses(User mentor);
    List<CourseResponse> getPendingApprovalCourses();
    List<CourseResponse> getCoursesByStatus(com.skillsphere.enums.CourseStatus status);
    AdminCourseReviewResponse getAdminCourseReviewById(Long id, User admin);
    CourseResponse approveCourse(Long id, User admin);
    CourseResponse rejectCourse(Long id, String reason, User admin);
    CourseResponse requestChanges(Long id, String reason, User admin);
    CourseResponse publishCourseAsAdmin(Long id, User admin);
    CourseResponse archiveCourse(Long id, User admin);
    List<CourseResponse> getPublishedCourses();
    List<CourseResponse> searchPublishedCourses(String title, String category);
    CourseResponse getCourseById(Long id);
    CourseDetailsResponse getCourseDetailsById(Long id);
}
