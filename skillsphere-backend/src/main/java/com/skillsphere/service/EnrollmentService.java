package com.skillsphere.service;

import com.skillsphere.dto.EnrollmentResponse;

import java.util.List;

public interface EnrollmentService {
    EnrollmentResponse enrollStudent(Long courseId);
    List<EnrollmentResponse> getMyEnrollments();
    List<EnrollmentResponse> getMentorEnrollments();
    List<EnrollmentResponse> getEnrollmentsForCourse(Long courseId);
    long getEnrollmentCountForCourse(Long courseId);
    EnrollmentResponse updateProgress(Long enrollmentId, Integer progress, Integer lessonsCompleted);
    EnrollmentResponse markLessonComplete(Long lessonId);
    EnrollmentResponse markLessonIncomplete(Long lessonId);
    List<Long> getCompletedLessonIdsForCourse(Long courseId);
    EnrollmentResponse saveNotes(Long enrollmentId, String notes);
    EnrollmentResponse saveBookmarks(Long enrollmentId, String bookmarks);
    EnrollmentResponse updateLastOpenedLesson(Long enrollmentId, Long lessonId);
}
