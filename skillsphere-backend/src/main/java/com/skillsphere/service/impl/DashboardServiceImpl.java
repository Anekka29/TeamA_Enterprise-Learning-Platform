package com.skillsphere.service.impl;

import com.skillsphere.dto.AdminDashboardResponse;
import com.skillsphere.dto.DashboardAchievementItem;
import com.skillsphere.dto.DashboardActivityItem;
import com.skillsphere.dto.DashboardCourseItem;
import com.skillsphere.dto.DashboardNotificationItem;
import com.skillsphere.dto.DashboardSessionItem;
import com.skillsphere.dto.MentorDashboardResponse;
import com.skillsphere.dto.ProfileResponse;
import com.skillsphere.dto.StudentDashboardResponse;
import com.skillsphere.entity.AssignmentSubmission;
import com.skillsphere.entity.AuditLog;
import com.skillsphere.entity.Course;
import com.skillsphere.entity.Enrollment;
import com.skillsphere.entity.LessonCompletion;
import com.skillsphere.entity.Notification;
import com.skillsphere.entity.QuizResult;
import com.skillsphere.entity.User;
import com.skillsphere.enums.CourseStatus;
import com.skillsphere.enums.Role;
import com.skillsphere.repository.AssignmentRepository;
import com.skillsphere.repository.AssignmentSubmissionRepository;
import com.skillsphere.repository.AuditLogRepository;
import com.skillsphere.repository.ComplaintRepository;
import com.skillsphere.repository.CourseRepository;
import com.skillsphere.repository.EnrollmentRepository;
import com.skillsphere.repository.LessonCompletionRepository;
import com.skillsphere.repository.NotificationRepository;
import com.skillsphere.repository.QuizRepository;
import com.skillsphere.repository.QuizResultRepository;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.DashboardService;
import com.skillsphere.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonCompletionRepository lessonCompletionRepository;
    private final NotificationRepository notificationRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final QuizRepository quizRepository;
    private final QuizResultRepository quizResultRepository;
    private final ComplaintRepository complaintRepository;
    private final AuditLogRepository auditLogRepository;
    private final ProfileService profileService;

    @Override
    public StudentDashboardResponse getStudentDashboard(User student) {
        ProfileResponse profile = profileService.getCurrentUserProfile();
        List<Enrollment> enrollments = enrollmentRepository.findByStudentIdOrderByEnrolledAtDesc(student.getId());
        List<LessonCompletion> recentCompletions = lessonCompletionRepository.findTop20ByStudentIdOrderByCompletedAtDesc(student.getId());
        long lessonCompletionCount = lessonCompletionRepository.countByStudentId(student.getId());
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(student);
        long unreadCount = notificationRepository.countByUserAndReadFalse(student);

        List<DashboardCourseItem> enrolledCourses = enrollments.stream()
                .map(this::mapEnrollmentToDashboardCourse)
                .collect(Collectors.toList());

        int activeCourses = (int) enrollments.stream()
                .filter(enrollment -> enrollment.getProgress() != null && enrollment.getProgress() > 0 && enrollment.getProgress() < 100)
                .count();

        int completedCourses = (int) enrollments.stream()
                .filter(enrollment -> enrollment.getProgress() != null && enrollment.getProgress() >= 100)
                .count();

        int totalStudyHours = enrollments.stream()
                .mapToInt(this::estimateStudyHoursFromProgress)
                .sum();

        // XP is derived from persisted lesson completions and completed courses.
        int xpPoints = (int) (lessonCompletionCount * 10L + completedCourses * 100L);
        int currentStreak = calculateCurrentStreak(recentCompletions);

        DashboardCourseItem continueLearningCourse = enrollments.stream()
                .filter(enrollment -> enrollment.getProgress() != null && enrollment.getProgress() < 100)
                .sorted(Comparator
                        .comparing((Enrollment enrollment) -> enrollment.getProgress() == null ? 0 : enrollment.getProgress())
                        .reversed()
                        .thenComparing(Enrollment::getEnrolledAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapEnrollmentToDashboardCourse)
                .findFirst()
                .orElse(null);

        Set<Long> enrolledCourseIds = enrollments.stream()
                .map(enrollment -> enrollment.getCourse().getId())
                .collect(Collectors.toSet());

        List<DashboardCourseItem> recommendedCourses = courseRepository.findByStatusIn(List.of(CourseStatus.APPROVED, CourseStatus.PUBLISHED)).stream()
                .filter(course -> !enrolledCourseIds.contains(course.getId()))
                .sorted(Comparator.comparing(Course::getPublishedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Course::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(4)
                .map(this::mapCourseToDashboardItem)
                .collect(Collectors.toList());

        List<DashboardAchievementItem> achievements = buildStudentAchievements(enrollments, recentCompletions, lessonCompletionCount, currentStreak);

        List<DashboardSessionItem> upcomingSessionsList = List.of(
                DashboardSessionItem.builder()
                        .title("Java Core Architecture & Clean Code Live Q&A")
                        .mentorName("Enterprise Mentor")
                        .scheduledAt(LocalDateTime.now().plusDays(1).withHour(15).withMinute(0))
                        .link("https://zoom.us/j/98765432101?pwd=skillsphere_live")
                        .status("UPCOMING")
                        .build(),
                DashboardSessionItem.builder()
                        .title("Spring Boot, JPA & Microservices Deep Dive")
                        .mentorName("Enterprise Mentor")
                        .scheduledAt(LocalDateTime.now().plusDays(3).withHour(16).withMinute(30))
                        .link("https://zoom.us/j/98765432102?pwd=skillsphere_live")
                        .status("UPCOMING")
                        .build(),
                DashboardSessionItem.builder()
                        .title("Full-Stack CapStone Project Evaluation & Code Review")
                        .mentorName("Enterprise Mentor")
                        .scheduledAt(LocalDateTime.now().plusDays(5).withHour(14).withMinute(0))
                        .link("https://zoom.us/j/98765432103?pwd=skillsphere_live")
                        .status("UPCOMING")
                        .build()
        );

        return StudentDashboardResponse.builder()
                .studentName(student.getFullName())
                .profileCompletionPercentage(profile.getProfileCompletionPercentage())
                .activeEnrolledCourses(activeCourses)
                .completedCourses(completedCourses)
                .totalStudyHours(totalStudyHours)
                .xpPoints(xpPoints)
                .currentStreak(currentStreak)
                .achievementsCount(achievements.size())
                .certificatesCount(completedCourses)
                .weeklyProgressPercentage(completedCourses > 0 || !recentCompletions.isEmpty() ? 75 : 0)
                .quizzesPendingCount(3)
                .continueLearningCourse(continueLearningCourse)
                .enrolledCourses(enrolledCourses)
                .recommendedCourses(recommendedCourses)
                .recentAchievements(achievements)
                .upcomingSessions(upcomingSessionsList)
                .notifications(notifications.stream().limit(5).map(this::mapNotification).collect(Collectors.toList()))
                .unreadNotificationCount(unreadCount)
                .build();
    }

    @Override
    public MentorDashboardResponse getMentorDashboard(User mentor) {
        ProfileResponse profile = profileService.getCurrentUserProfile();
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(mentor);
        long unreadCount = notificationRepository.countByUserAndReadFalse(mentor);

        List<DashboardActivityItem> recentActivity = new ArrayList<>();

        enrollmentRepository.findTop5ByCourseMentorIdOrderByEnrolledAtDesc(mentor.getId()).forEach(enrollment ->
                recentActivity.add(DashboardActivityItem.builder()
                        .type("ENROLLMENT")
                        .title("New course enrollment")
                        .description(String.format("%s joined %s", enrollment.getStudent().getFullName(), enrollment.getCourse().getTitle()))
                        .timestamp(enrollment.getEnrolledAt())
                        .build()));

        assignmentSubmissionRepository.findTop5ByAssignmentCourseMentorIdOrderBySubmittedAtDesc(mentor.getId()).forEach(submission ->
                recentActivity.add(DashboardActivityItem.builder()
                        .type("ASSIGNMENT")
                        .title("Assignment submitted")
                        .description(String.format("%s submitted %s - %s", submission.getStudent().getFullName(), submission.getAssignment().getCourse().getTitle(), submission.getAssignment().getTitle()))
                        .timestamp(submission.getSubmittedAt())
                        .build()));

        lessonCompletionRepository.findTop5ByCourseMentorIdOrderByCompletedAtDesc(mentor.getId()).forEach(completion ->
                recentActivity.add(DashboardActivityItem.builder()
                        .type("LESSON")
                        .title("Lesson completed")
                        .description(String.format("%s completed %s", completion.getStudent().getFullName(), completion.getLesson().getTitle()))
                        .timestamp(completion.getCompletedAt())
                        .build()));

        quizResultRepository.findTop5ByQuizCourseMentorIdOrderByCompletedAtDesc(mentor.getId()).forEach(result ->
                recentActivity.add(DashboardActivityItem.builder()
                        .type("QUIZ")
                        .title("Quiz completed")
                        .description(String.format("%s completed %s with %d/%d",
                                result.getStudent().getFullName(),
                                result.getQuiz().getTitle(),
                                result.getScore(),
                                result.getTotalPoints()))
                        .timestamp(result.getCompletedAt() != null ? result.getCompletedAt() : result.getStartedAt())
                        .build()));

        List<DashboardActivityItem> topActivity = recentActivity.stream()
                .filter(activity -> activity.getTimestamp() != null)
                .sorted(Comparator.comparing(DashboardActivityItem::getTimestamp).reversed())
                .limit(6)
                .collect(Collectors.toList());

        long totalCourses = courseRepository.countByMentorId(mentor.getId());
        long publishedCourses = courseRepository.countByMentorIdAndStatusIn(mentor.getId(), List.of(CourseStatus.APPROVED, CourseStatus.PUBLISHED));
        long draftCourses = courseRepository.countByMentorIdAndStatusIn(mentor.getId(), List.of(CourseStatus.DRAFT, CourseStatus.SUBMITTED, CourseStatus.UNDER_REVIEW));
        if (draftCourses == 0 && totalCourses > publishedCourses) {
            draftCourses = totalCourses - publishedCourses;
        }

        long pendingSubmissions = assignmentSubmissionRepository.countByAssignmentCourseMentorIdAndGradeIsNull(mentor.getId());
        long pendingAssignmentsCount = pendingSubmissions > 0
                ? pendingSubmissions
                : assignmentRepository.countByCourseMentorId(mentor.getId());

        long unpublishedQuizzes = quizRepository.countByCourseMentorIdAndPublishedFalse(mentor.getId());
        long pendingQuizzesCount = unpublishedQuizzes > 0
                ? unpublishedQuizzes
                : quizRepository.countByCourseMentorId(mentor.getId());

        List<DashboardSessionItem> mentorSessionsList = List.of(
                DashboardSessionItem.builder()
                        .title("Java Core Architecture & Clean Code Live Q&A")
                        .mentorName(mentor.getFullName() != null ? mentor.getFullName() : "Enterprise Mentor")
                        .scheduledAt(LocalDateTime.now().plusDays(1).withHour(15).withMinute(0))
                        .link("https://zoom.us/j/98765432101?pwd=skillsphere_live")
                        .status("UPCOMING")
                        .build(),
                DashboardSessionItem.builder()
                        .title("Spring Boot, JPA & Microservices Deep Dive")
                        .mentorName(mentor.getFullName() != null ? mentor.getFullName() : "Enterprise Mentor")
                        .scheduledAt(LocalDateTime.now().plusDays(3).withHour(16).withMinute(30))
                        .link("https://zoom.us/j/98765432102?pwd=skillsphere_live")
                        .status("UPCOMING")
                        .build(),
                DashboardSessionItem.builder()
                        .title("Full-Stack CapStone Project Evaluation & Code Review")
                        .mentorName(mentor.getFullName() != null ? mentor.getFullName() : "Enterprise Mentor")
                        .scheduledAt(LocalDateTime.now().plusDays(5).withHour(14).withMinute(0))
                        .link("https://zoom.us/j/98765432103?pwd=skillsphere_live")
                        .status("UPCOMING")
                        .build()
        );

        return MentorDashboardResponse.builder()
                .mentorName(mentor.getFullName())
                .profileCompletionPercentage(profile.getProfileCompletionPercentage())
                .coursesCreated(Math.toIntExact(totalCourses))
                .publishedCourses(Math.toIntExact(publishedCourses))
                .draftCourses(Math.toIntExact(draftCourses))
                .totalStudents(Math.toIntExact(enrollmentRepository.countDistinctStudentsByMentorId(mentor.getId())))
                .totalEnrollments(Math.toIntExact(enrollmentRepository.countByCourseMentorId(mentor.getId())))
                .pendingAssignments(Math.toIntExact(pendingAssignmentsCount))
                .pendingQuizzes(Math.toIntExact(pendingQuizzesCount))
                .recentStudentActivity(topActivity)
                .upcomingSessions(mentorSessionsList)
                .notifications(notifications.stream().limit(5).map(this::mapNotification).collect(Collectors.toList()))
                .unreadNotificationCount(unreadCount)
                .build();
    }

    @Override
    public AdminDashboardResponse getAdminDashboard(User admin) {
        ProfileResponse profile = profileService.getCurrentUserProfile();
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(admin);
        long unreadCount = notificationRepository.countByUserAndReadFalse(admin);

        List<AuditLog> dbAuditLogs = auditLogRepository.findTop20ByOrderByCreatedAtDesc();
        List<DashboardActivityItem> auditLogItems = dbAuditLogs.stream()
                .map(logItem -> DashboardActivityItem.builder()
                        .type(logItem.getAction())
                        .title(logItem.getAction() != null ? logItem.getAction() : "AUDIT_EVENT")
                        .description((logItem.getDetails() != null ? logItem.getDetails() : "") + (logItem.getAdminEmail() != null ? " (by " + logItem.getAdminEmail() + ")" : ""))
                        .timestamp(logItem.getCreatedAt() != null ? logItem.getCreatedAt() : LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());

        return AdminDashboardResponse.builder()
                .adminName(admin.getFullName())
                .profileCompletionPercentage(profile.getProfileCompletionPercentage())
                .totalUsers(Math.toIntExact(userRepository.count()))
                .students(Math.toIntExact(userRepository.countByRole(Role.STUDENT)))
                .mentors(Math.toIntExact(userRepository.countByRole(Role.MENTOR)))
                .admins(Math.toIntExact(userRepository.countByRole(Role.ADMIN)))
                .totalCourses(Math.toIntExact(courseRepository.count()))
                .pendingCourseApprovals(Math.toIntExact(courseRepository.countByStatus(CourseStatus.SUBMITTED)))
                .activeCourses(Math.toIntExact(courseRepository.countByStatusIn(List.of(CourseStatus.APPROVED, CourseStatus.PUBLISHED))))
                .complaints(Math.toIntExact(complaintRepository.count()))
                .reports(0)
                .auditLogs(auditLogItems)
                .notifications(notifications.stream().limit(5).map(this::mapNotification).collect(Collectors.toList()))
                .unreadNotificationCount(unreadCount)
                .build();
    }

    private DashboardCourseItem mapEnrollmentToDashboardCourse(Enrollment enrollment) {
        Course course = enrollment.getCourse();
        return DashboardCourseItem.builder()
                .id(course.getId())
                .title(course.getTitle())
                .category(course.getCategory())
                .level(course.getLevel())
                .mentorName(course.getMentor().getFullName())
                .thumbnailUrl(course.getThumbnailUrl())
                .shortDescription(firstNonBlank(course.getShortDescription(), course.getDescription()))
                .estimatedDuration(firstNonBlank(course.getEstimatedDuration(), "Self-paced"))
                .estimatedLearningHours(course.getEstimatedLearningHours())
                .progress(enrollment.getProgress())
                .enrollmentCount(Math.toIntExact(enrollmentRepository.countByCourseId(course.getId())))
                .status(course.getStatus())
                .updatedAt(course.getUpdatedAt())
                .build();
    }

    private DashboardCourseItem mapCourseToDashboardItem(Course course) {
        return DashboardCourseItem.builder()
                .id(course.getId())
                .title(course.getTitle())
                .category(course.getCategory())
                .level(course.getLevel())
                .mentorName(course.getMentor().getFullName())
                .thumbnailUrl(course.getThumbnailUrl())
                .shortDescription(firstNonBlank(course.getShortDescription(), course.getDescription()))
                .estimatedDuration(firstNonBlank(course.getEstimatedDuration(), "Self-paced"))
                .estimatedLearningHours(course.getEstimatedLearningHours())
                .progress(null)
                .enrollmentCount(Math.toIntExact(enrollmentRepository.countByCourseId(course.getId())))
                .status(course.getStatus())
                .updatedAt(course.getUpdatedAt())
                .build();
    }

    private DashboardNotificationItem mapNotification(Notification notification) {
        return DashboardNotificationItem.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .link(notification.getLink())
                .read(notification.getRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private List<DashboardAchievementItem> buildStudentAchievements(
            List<Enrollment> enrollments,
            List<LessonCompletion> recentCompletions,
            long totalLessonCompletions,
            int currentStreak
    ) {
        List<DashboardAchievementItem> achievements = new ArrayList<>();

        if (!enrollments.isEmpty()) {
            LocalDateTime firstEnrollmentAt = enrollments.stream()
                    .map(Enrollment::getEnrolledAt)
                    .filter(Objects::nonNull)
                    .min(LocalDateTime::compareTo)
                    .orElse(null);
            achievements.add(DashboardAchievementItem.builder()
                    .title("First Enrollment")
                    .description("Started the first SkillSphere course")
                    .icon("bi-rocket-takeoff-fill")
                    .achievedAt(firstEnrollmentAt)
                    .build());
        }

        if (totalLessonCompletions >= 10) {
            LocalDateTime achievedAt = recentCompletions.stream()
                    .map(LessonCompletion::getCompletedAt)
                    .filter(Objects::nonNull)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);
            achievements.add(DashboardAchievementItem.builder()
                    .title("Practice Builder")
                    .description("Completed 10 lessons")
                    .icon("bi-bullseye")
                    .achievedAt(achievedAt)
                    .build());
        }

        long completedCourses = enrollments.stream()
                .filter(enrollment -> enrollment.getProgress() != null && enrollment.getProgress() >= 100)
                .count();
        if (completedCourses > 0) {
            achievements.add(DashboardAchievementItem.builder()
                    .title("Course Finisher")
                    .description("Completed at least one full course")
                    .icon("bi-lightning-fill")
                    .achievedAt(recentCompletions.stream()
                            .map(LessonCompletion::getCompletedAt)
                            .filter(Objects::nonNull)
                            .max(LocalDateTime::compareTo)
                            .orElse(null))
                    .build());
        }

        if (currentStreak >= 3) {
            achievements.add(DashboardAchievementItem.builder()
                    .title("Consistency Streak")
                    .description(String.format("Maintained a %d-day learning streak", currentStreak))
                    .icon("bi-fire")
                    .achievedAt(recentCompletions.stream()
                            .map(LessonCompletion::getCompletedAt)
                            .filter(Objects::nonNull)
                            .max(LocalDateTime::compareTo)
                            .orElse(null))
                    .build());
        }

        return achievements.stream()
                .sorted(Comparator.comparing(DashboardAchievementItem::getAchievedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(4)
                .collect(Collectors.toList());
    }

    private int calculateCurrentStreak(List<LessonCompletion> completions) {
        if (completions.isEmpty()) {
            return 0;
        }

        Set<LocalDate> uniqueCompletionDays = completions.stream()
                .map(LessonCompletion::getCompletedAt)
                .filter(Objects::nonNull)
                .map(LocalDateTime::toLocalDate)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        if (uniqueCompletionDays.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate cursor = uniqueCompletionDays.contains(today) ? today : today.minusDays(1);

        int streak = 0;
        while (uniqueCompletionDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private int estimateStudyHoursFromProgress(Enrollment enrollment) {
        Integer learningHours = enrollment.getCourse().getEstimatedLearningHours();
        if (learningHours == null || learningHours <= 0 || enrollment.getProgress() == null || enrollment.getProgress() <= 0) {
            return 0;
        }

        return (int) Math.round((learningHours * enrollment.getProgress()) / 100.0);
    }

    private String firstNonBlank(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        return fallback;
    }
}
