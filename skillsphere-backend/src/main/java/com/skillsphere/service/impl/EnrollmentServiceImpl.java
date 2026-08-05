package com.skillsphere.service.impl;

import com.skillsphere.dto.EnrollmentResponse;
import com.skillsphere.entity.Course;
import com.skillsphere.entity.CourseModule;
import com.skillsphere.entity.Enrollment;
import com.skillsphere.entity.Lesson;
import com.skillsphere.entity.LessonCompletion;
import com.skillsphere.entity.User;
import com.skillsphere.enums.CourseStatus;
import com.skillsphere.exception.UserNotFoundException;
import com.skillsphere.repository.CourseModuleRepository;
import com.skillsphere.repository.CourseRepository;
import com.skillsphere.repository.EnrollmentRepository;
import com.skillsphere.repository.LessonCompletionRepository;
import com.skillsphere.repository.LessonRepository;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final LessonCompletionRepository lessonCompletionRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final com.skillsphere.service.NotificationService notificationService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private int calculateTotalLessons(Course course) {
        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByOrderIndexAsc(course.getId());
        int total = 0;
        for (CourseModule module : modules) {
            List<Lesson> lessons = lessonRepository.findByModuleIdOrderByOrderIndexAsc(module.getId());
            total += lessons.size();
        }
        return total;
    }

    private void updateEnrollmentProgress(Enrollment enrollment) {
        int completed = (int) lessonCompletionRepository.countByEnrollmentId(enrollment.getId());
        int total = calculateTotalLessons(enrollment.getCourse());
        int progress = total > 0 ? (int) Math.round((double) completed / total * 100) : 0;
        enrollment.setLessonsCompleted(completed);
        enrollment.setProgress(progress);
        enrollmentRepository.save(enrollment);
    }

    private EnrollmentResponse mapToResponse(Enrollment enrollment) {
        User student = enrollment.getStudent();
        boolean certIssued = enrollment.getProgress() != null && enrollment.getProgress() >= 100;
        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .courseCategory(enrollment.getCourse().getCategory())
                .courseLevel(enrollment.getCourse().getLevel())
                .courseDescription(enrollment.getCourse().getDescription())
                .mentorName(enrollment.getCourse().getMentor() != null ? enrollment.getCourse().getMentor().getFullName() : "Mentor")
                .mentorEmail(enrollment.getCourse().getMentor() != null ? enrollment.getCourse().getMentor().getEmail() : "")
                .studentId(student != null ? student.getId() : null)
                .studentName(student != null ? student.getFullName() : "Student")
                .studentEmail(student != null ? student.getEmail() : "")
                .studentPhone(student != null ? student.getPhoneNumber() : "")
                .certificateIssued(certIssued)
                .lastOpenedLessonId(enrollment.getLastOpenedLessonId())
                .lastOpenedAt(enrollment.getLastOpenedAt())
                .notes(enrollment.getNotes())
                .bookmarks(enrollment.getBookmarks())
                .enrolledAt(enrollment.getEnrolledAt())
                .progress(enrollment.getProgress())
                .lessonsCompleted(enrollment.getLessonsCompleted())
                .build();
    }

    @Override
    @Transactional
    public EnrollmentResponse enrollStudent(Long courseId) {
        User student = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new UserNotFoundException("Course not found"));
        
        if (course.getStatus() != CourseStatus.PUBLISHED && course.getStatus() != CourseStatus.APPROVED) {
            throw new IllegalArgumentException("Only published or approved courses can be enrolled in");
        }
        
        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new IllegalArgumentException("Student is already enrolled in this course");
        }
        
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .enrolledAt(LocalDateTime.now())
                .progress(0)
                .lessonsCompleted(0)
                .build();
        
        Enrollment saved = enrollmentRepository.save(enrollment);
        
        // Increment course enrollment count
        long currentCount = course.getEnrollmentCount() != null ? course.getEnrollmentCount() : 0;
        course.setEnrollmentCount(currentCount + 1);
        courseRepository.save(course);
        
        // Send notification to mentor about new enrollment
        try {
            if (course.getMentor() != null) {
                notificationService.createNotification(
                        course.getMentor(),
                        "New Student Enrolled",
                        student.getFullName() + " has enrolled in your course '" + course.getTitle() + "'",
                        "#courses",
                        false
                );
            }
        } catch (Exception e) {
            log.error("Failed to create notification for enrollment", e);
        }
        
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments() {
        User student = getCurrentUser();
        return enrollmentRepository.findByStudentId(student.getId())
                .stream()
                .peek(this::updateEnrollmentProgress) // Update progress before returning
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollmentsForCourse(Long courseId) {
        User mentor = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new UserNotFoundException("Course not found"));
        
        if (!course.getMentor().getId().equals(mentor.getId())) {
            throw new IllegalArgumentException("You are not the owner of this course");
        }
        
        return enrollmentRepository.findByCourseId(courseId)
                .stream()
                .peek(this::updateEnrollmentProgress) // Update progress before returning
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getEnrollmentCountForCourse(Long courseId) {
        return enrollmentRepository.countByCourseId(courseId);
    }

    @Override
    @Transactional
    @Deprecated
    public EnrollmentResponse updateProgress(Long enrollmentId, Integer progress, Integer lessonsCompleted) {
        // Deprecated in favor of markLessonComplete / markLessonIncomplete
        User student = getCurrentUser();
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new UserNotFoundException("Enrollment not found"));
        
        if (!enrollment.getStudent().getId().equals(student.getId())) {
            throw new IllegalArgumentException("You can only update your own enrollment progress");
        }
        
        if (progress != null) {
            enrollment.setProgress(Math.min(progress, 100));
        }
        
        if (lessonsCompleted != null) {
            enrollment.setLessonsCompleted(lessonsCompleted);
        }
        
        Enrollment saved = enrollmentRepository.save(enrollment);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EnrollmentResponse markLessonComplete(Long lessonId) {
        User student = getCurrentUser();
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new UserNotFoundException("Lesson not found"));
        
        // Check if student is enrolled in the course
        Course course = lesson.getModule().getCourse();
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), course.getId())
                .orElseThrow(() -> new IllegalArgumentException("You are not enrolled in this course"));
        
        // Check if lesson is already completed
        if (lessonCompletionRepository.findByStudentIdAndLessonId(student.getId(), lessonId).isPresent()) {
            updateEnrollmentProgress(enrollment);
            return mapToResponse(enrollment);
        }
        
        // Create lesson completion
        LessonCompletion completion = LessonCompletion.builder()
                .student(student)
                .lesson(lesson)
                .course(course)
                .enrollment(enrollment)
                .completedAt(LocalDateTime.now())
                .build();
        lessonCompletionRepository.save(completion);
        
        // Update enrollment progress
        updateEnrollmentProgress(enrollment);
        return mapToResponse(enrollment);
    }

    @Override
    @Transactional
    public EnrollmentResponse markLessonIncomplete(Long lessonId) {
        User student = getCurrentUser();
        LessonCompletion completion = lessonCompletionRepository.findByStudentIdAndLessonId(student.getId(), lessonId)
                .orElseThrow(() -> new UserNotFoundException("Lesson completion not found"));
        
        Enrollment enrollment = completion.getEnrollment();
        lessonCompletionRepository.delete(completion);
        
        // Update enrollment progress
        updateEnrollmentProgress(enrollment);
        return mapToResponse(enrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getCompletedLessonIdsForCourse(Long courseId) {
        User student = getCurrentUser();
        // Check if student is enrolled
        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new IllegalArgumentException("You are not enrolled in this course");
        }
        return lessonCompletionRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .stream()
                .map(completion -> completion.getLesson().getId())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EnrollmentResponse saveNotes(Long enrollmentId, String notes) {
        User student = getCurrentUser();
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new UserNotFoundException("Enrollment not found"));
        if (!enrollment.getStudent().getId().equals(student.getId())) {
            throw new IllegalArgumentException("You can only edit notes on your own enrollment");
        }
        enrollment.setNotes(notes);
        Enrollment saved = enrollmentRepository.save(enrollment);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EnrollmentResponse saveBookmarks(Long enrollmentId, String bookmarks) {
        User student = getCurrentUser();
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new UserNotFoundException("Enrollment not found"));
        if (!enrollment.getStudent().getId().equals(student.getId())) {
            throw new IllegalArgumentException("You can only edit bookmarks on your own enrollment");
        }
        enrollment.setBookmarks(bookmarks);
        Enrollment saved = enrollmentRepository.save(enrollment);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EnrollmentResponse updateLastOpenedLesson(Long enrollmentId, Long lessonId) {
        User student = getCurrentUser();
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new UserNotFoundException("Enrollment not found"));
        if (!enrollment.getStudent().getId().equals(student.getId())) {
            throw new IllegalArgumentException("You can only update your own enrollment");
        }
        enrollment.setLastOpenedLessonId(lessonId);
        enrollment.setLastOpenedAt(LocalDateTime.now());
        Enrollment saved = enrollmentRepository.save(enrollment);
        return mapToResponse(saved);
    }
}
