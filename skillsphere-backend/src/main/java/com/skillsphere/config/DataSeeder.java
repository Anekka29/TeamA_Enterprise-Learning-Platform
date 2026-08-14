package com.skillsphere.config;

import com.skillsphere.entity.*;
import com.skillsphere.enums.CourseStatus;
import com.skillsphere.enums.NotificationType;
import com.skillsphere.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final ComplaintRepository complaintRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    @Bean
    @Order(2)
    public CommandLineRunner seedProjectData() {
        return args -> {
            log.info("Checking SkillSphere initial data seeding requirements...");

            User admin = userRepository.findByEmail("tsanekka@gmail.com").orElse(null);
            User student1 = userRepository.findByEmail("singhchandni1610@gmail.com").orElse(null);
            User student2 = userRepository.findByEmail("sri@gmail.com").orElse(null);

            List<Course> courses = courseRepository.findAll();
            if (courses.isEmpty()) {
                log.info("No courses found in database.");
                return;
            }

            log.info("Found {} existing courses in database.", courses.size());

            // Ensure balanced course statuses for dashboards
            if (courses.size() >= 2) {
                long draftCount = courseRepository.countByStatusIn(List.of(CourseStatus.DRAFT, CourseStatus.SUBMITTED, CourseStatus.UNDER_REVIEW));
                if (draftCount == 0 && courses.size() >= 5) {
                    Course c1 = courses.get(courses.size() - 1);
                    c1.setStatus(CourseStatus.DRAFT);
                    courseRepository.save(c1);

                    Course c2 = courses.get(courses.size() - 2);
                    c2.setStatus(CourseStatus.SUBMITTED);
                    courseRepository.save(c2);
                    log.info("Updated sample course statuses: 2 courses assigned to DRAFT & SUBMITTED.");
                }
            }

            // 1. Seed Enrollments
            if (student1 != null) {
                for (int i = 0; i < Math.min(4, courses.size()); i++) {
                    Course course = courses.get(i);
                    boolean isCompleted = (i < 2);
                    if (enrollmentRepository.findByStudentIdAndCourseId(student1.getId(), course.getId()).isEmpty()) {
                        Enrollment enrollment = Enrollment.builder()
                                .student(student1)
                                .course(course)
                                .progress(isCompleted ? 100 : (i == 2 ? 40 : 15))
                                .lessonsCompleted(isCompleted ? 10 : (i == 2 ? 3 : 1))
                                .notes("Notes for " + course.getTitle())
                                .enrolledAt(LocalDateTime.now().minusDays(10 - i * 2))
                                .lastOpenedAt(LocalDateTime.now().minusDays(i))
                                .build();
                        enrollmentRepository.save(enrollment);
                        log.info("Seeded enrollment for student: {} in course: {} (Progress: {}%)", student1.getEmail(), course.getTitle(), isCompleted ? 100 : 40);
                    }
                }
            }

            if (student2 != null) {
                for (int i = 0; i < Math.min(4, courses.size()); i++) {
                    Course course = courses.get(i);
                    boolean isCompleted = (i < 2);
                    if (enrollmentRepository.findByStudentIdAndCourseId(student2.getId(), course.getId()).isEmpty()) {
                        Enrollment enrollment = Enrollment.builder()
                                .student(student2)
                                .course(course)
                                .progress(isCompleted ? 100 : 50)
                                .lessonsCompleted(isCompleted ? 10 : 4)
                                .notes("Learning progress active")
                                .enrolledAt(LocalDateTime.now().minusDays(5))
                                .lastOpenedAt(LocalDateTime.now())
                                .build();
                        enrollmentRepository.save(enrollment);
                    }
                }
            }

            // Ensure first 2 enrolled courses for every existing student in DB are marked 100% completed
            List<User> existingStudents = userRepository.findByRole(com.skillsphere.enums.Role.STUDENT);
            for (User st : existingStudents) {
                List<Enrollment> stEnrollments = enrollmentRepository.findByStudentIdOrderByEnrolledAtDesc(st.getId());
                if (stEnrollments.size() >= 2) {
                    for (int k = 0; k < Math.min(2, stEnrollments.size()); k++) {
                        Enrollment e = stEnrollments.get(k);
                        if (e.getProgress() == null || e.getProgress() < 100) {
                            e.setProgress(100);
                            e.setLessonsCompleted(10);
                            enrollmentRepository.save(e);
                        }
                    }
                }
            }

            // 2. Seed Quizzes & Quiz Questions
            if (quizRepository.count() == 0) {
                log.info("Seeding quizzes and questions...");
                int qIdx = 0;
                for (Course course : courses) {
                    boolean isPublished = (qIdx % 2 == 0);
                    Quiz quiz = Quiz.builder()
                            .course(course)
                            .title(course.getTitle() + " - Mastery Quiz")
                            .description("Comprehensive evaluation quiz covering core concepts of " + course.getTitle())
                            .timeLimitMinutes(30)
                            .totalPoints(20)
                            .published(isPublished)
                            .createdAt(LocalDateTime.now().minusDays(3))
                            .updatedAt(LocalDateTime.now())
                            .build();
                    qIdx++;

                    Quiz savedQuiz = quizRepository.save(quiz);

                    QuizQuestion q1 = QuizQuestion.builder()
                            .quiz(savedQuiz)
                            .orderIndex(1)
                            .questionText("What is the primary core concept demonstrated in " + course.getTitle() + "?")
                            .points(10)
                            .optionA("Fundamental Theory and Core Abstractions")
                            .optionB("Unrelated Legacy Syntax")
                            .optionC("Deprecated Third-party Library")
                            .optionD("None of the above")
                            .correctOption("A")
                            .build();

                    QuizQuestion q2 = QuizQuestion.builder()
                            .quiz(savedQuiz)
                            .orderIndex(2)
                            .questionText("Which best practice is emphasized throughout " + course.getTitle() + "?")
                            .points(10)
                            .optionA("Ad-hoc hardcoding")
                            .optionB("Structured modular design and clean practices")
                            .optionC("Ignoring security guidelines")
                            .optionD("Manual file execution only")
                            .correctOption("B")
                            .build();

                    quizQuestionRepository.saveAll(List.of(q1, q2));
                    log.info("Seeded Quiz '{}' for course '{}'", savedQuiz.getTitle(), course.getTitle());
                }
            }

            // 3. Seed Complaints
            if (complaintRepository.count() == 0) {
                log.info("Seeding student complaints...");
                User reporter = student1 != null ? student1 : (student2 != null ? student2 : admin);
                if (reporter != null) {
                    Complaint c1 = Complaint.builder()
                            .student(reporter)
                            .subject("Video Playback Buffering in Module 2")
                            .description("The video lesson in Module 2 experiences intermittent buffering when loaded on high resolution.")
                            .category("TECHNICAL")
                            .status("PENDING")
                            .createdAt(LocalDateTime.now().minusDays(2))
                            .updatedAt(LocalDateTime.now().minusDays(2))
                            .build();

                    Complaint c2 = Complaint.builder()
                            .student(reporter)
                            .subject("Clarification on Assignment 1 Submission Format")
                            .description("Requesting details on whether PDF or ZIP repository link is preferred for Assignment 1.")
                            .category("ACADEMIC")
                            .status("IN_PROGRESS")
                            .assignedTo("Support Team")
                            .createdAt(LocalDateTime.now().minusDays(4))
                            .updatedAt(LocalDateTime.now().minusDays(1))
                            .build();

                    Complaint c3 = Complaint.builder()
                            .student(reporter)
                            .subject("Certificate Download Link Generation")
                            .description("Completed 100% of Java Fundamentals but certificate download button was delayed.")
                            .category("GENERAL")
                            .status("RESOLVED")
                            .assignedTo("Admin")
                            .resolutionNotes("Verified 100% completion and re-triggered automated certificate PDF generation.")
                            .createdAt(LocalDateTime.now().minusDays(7))
                            .updatedAt(LocalDateTime.now().minusDays(3))
                            .build();

                    complaintRepository.saveAll(List.of(c1, c2, c3));
                    log.info("Seeded 3 support complaints.");
                }
            }

            // 4. Seed Assignments
            if (assignmentRepository.count() == 0) {
                log.info("Seeding course assignments...");
                for (int i = 0; i < Math.min(3, courses.size()); i++) {
                    Course course = courses.get(i);
                    Assignment assignment = Assignment.builder()
                            .course(course)
                            .title(course.getTitle() + " - Capstone Assignment")
                            .instructions("Build and submit a complete practical project applying all key skills learned in " + course.getTitle())
                            .dueDate(LocalDateTime.now().plusDays(7))
                            .createdAt(LocalDateTime.now().minusDays(5))
                            .updatedAt(LocalDateTime.now())
                            .build();

                    Assignment savedAssignment = assignmentRepository.save(assignment);

                    if (student1 != null) {
                        AssignmentSubmission submission = AssignmentSubmission.builder()
                                .assignment(savedAssignment)
                                .student(student1)
                                .submission("https://github.com/skillsphere-student/project-submission")
                                .submittedAt(LocalDateTime.now().minusDays(1))
                                .build();
                        assignmentSubmissionRepository.save(submission);
                    }
                }
            }

            // 5. Seed Notifications
            if (notificationRepository.count() == 0 && admin != null) {
                Notification n1 = Notification.builder()
                        .user(admin)
                        .title("System Health Nominal")
                        .message("All database and API endpoints operating at optimal performance.")
                        .type(NotificationType.ANNOUNCEMENT)
                        .link("#dashboard")
                        .read(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationRepository.save(n1);
            }

            // 6. Seed Audit Logs
            if (auditLogRepository.count() == 0) {
                String adminEmail = admin != null ? admin.getEmail() : "admin@enterprise.com";
                
                AuditLog a1 = AuditLog.builder()
                        .action("SYSTEM_INIT")
                        .adminEmail("SYSTEM")
                        .targetUser("ALL")
                        .targetCourse("PLATFORM")
                        .details("System initialization & enterprise security services configured successfully.")
                        .ipAddress("127.0.0.1")
                        .createdAt(LocalDateTime.now().minusHours(6))
                        .build();

                AuditLog a2 = AuditLog.builder()
                        .action("USER_ROLE_UPDATE")
                        .adminEmail(adminEmail)
                        .targetUser("student@enterprise.com")
                        .targetCourse("—")
                        .details("Role changed from STUDENT to STUDENT with full catalog access.")
                        .ipAddress("127.0.0.1")
                        .createdAt(LocalDateTime.now().minusHours(4))
                        .build();

                AuditLog a3 = AuditLog.builder()
                        .action("COURSE_APPROVED")
                        .adminEmail(adminEmail)
                        .targetUser("Mentor Staff")
                        .targetCourse("Full-Stack Enterprise React & Java Masterclass")
                        .details("Course approved and published to enterprise learning catalog.")
                        .ipAddress("127.0.0.1")
                        .createdAt(LocalDateTime.now().minusHours(2))
                        .build();

                AuditLog a4 = AuditLog.builder()
                        .action("SECURITY_AUDIT")
                        .adminEmail(adminEmail)
                        .targetUser("SYSTEM")
                        .targetCourse("SECURITY")
                        .details("SSL & JWT Authentication endpoint security policies validated.")
                        .ipAddress("127.0.0.1")
                        .createdAt(LocalDateTime.now().minusMinutes(30))
                        .build();

                auditLogRepository.saveAll(List.of(a1, a2, a3, a4));
                log.info("Persisted initial enterprise audit logs into MySQL repository.");
            }

            log.info("SkillSphere Data Seeding Completed Successfully.");
        };
    }
}
