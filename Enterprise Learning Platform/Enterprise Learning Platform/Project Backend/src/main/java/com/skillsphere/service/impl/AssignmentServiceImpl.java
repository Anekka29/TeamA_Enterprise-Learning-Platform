package com.skillsphere.service.impl;

import com.skillsphere.dto.AssignmentResponse;
import com.skillsphere.dto.AssignmentSubmissionResponse;
import com.skillsphere.dto.CreateAssignmentRequest;
import com.skillsphere.dto.GradeAssignmentRequest;
import com.skillsphere.dto.SubmitAssignmentRequest;
import com.skillsphere.entity.Assignment;
import com.skillsphere.entity.AssignmentSubmission;
import com.skillsphere.entity.Course;
import com.skillsphere.entity.User;
import com.skillsphere.exception.UserNotFoundException;
import com.skillsphere.repository.AssignmentRepository;
import com.skillsphere.repository.AssignmentSubmissionRepository;
import com.skillsphere.repository.CourseRepository;
import com.skillsphere.repository.EnrollmentRepository;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.AssignmentService;
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
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final com.skillsphere.service.NotificationService notificationService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private AssignmentResponse mapToAssignmentResponse(Assignment assignment) {
        return AssignmentResponse.builder()
                .id(assignment.getId())
                .courseId(assignment.getCourse().getId())
                .courseTitle(assignment.getCourse().getTitle())
                .title(assignment.getTitle())
                .instructions(assignment.getInstructions())
                .dueDate(assignment.getDueDate())
                .createdAt(assignment.getCreatedAt())
                .updatedAt(assignment.getUpdatedAt())
                .build();
    }

    private AssignmentSubmissionResponse mapToSubmissionResponse(AssignmentSubmission submission) {
        return AssignmentSubmissionResponse.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignment().getId())
                .assignmentTitle(submission.getAssignment().getTitle())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getFullName())
                .submission(submission.getSubmission())
                .submittedAt(submission.getSubmittedAt())
                .grade(submission.getGrade())
                .feedback(submission.getFeedback())
                .gradedAt(submission.getGradedAt())
                .gradedByName(submission.getGradedBy() != null ? submission.getGradedBy().getFullName() : null)
                .build();
    }

    @Override
    @Transactional
    public AssignmentResponse createAssignment(Long courseId, CreateAssignmentRequest request) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new UserNotFoundException("Course not found"));

        if (!course.getMentor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You are not the owner of this course");
        }

        Assignment assignment = Assignment.builder()
                .course(course)
                .title(request.getTitle())
                .instructions(request.getInstructions())
                .dueDate(request.getDueDate())
                .build();

        Assignment saved = assignmentRepository.save(assignment);
        
        // Send notifications to all enrolled students about new assignment
        enrollmentRepository.findByCourseId(courseId).forEach(enrollment -> {
            notificationService.createNotification(
                    enrollment.getStudent(),
                    "New Assignment Published",
                    "A new assignment '" + request.getTitle() + "' has been published for course '" + course.getTitle() + "'",
                    "#assignments",
                    false // Don't send email for every assignment
            );
        });
        
        return mapToAssignmentResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsForCourse(Long courseId) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new UserNotFoundException("Course not found"));

        if (course.getMentor().getId().equals(currentUser.getId())) {
            return assignmentRepository.findByCourseId(courseId)
                    .stream()
                    .map(this::mapToAssignmentResponse)
                    .collect(Collectors.toList());
        } else if (enrollmentRepository.existsByStudentIdAndCourseId(currentUser.getId(), courseId)) {
            return assignmentRepository.findByCourseId(courseId)
                    .stream()
                    .map(this::mapToAssignmentResponse)
                    .collect(Collectors.toList());
        } else {
            throw new IllegalArgumentException("You don't have access to this course's assignments");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsForStudent() {
        User student = getCurrentUser();
        return enrollmentRepository.findByStudentId(student.getId())
                .stream()
                .flatMap(enrollment -> assignmentRepository.findByCourseId(enrollment.getCourse().getId()).stream())
                .map(this::mapToAssignmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentResponse getAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new UserNotFoundException("Assignment not found"));

        User currentUser = getCurrentUser();
        Course course = assignment.getCourse();

        if (course.getMentor().getId().equals(currentUser.getId())) {
            return mapToAssignmentResponse(assignment);
        } else if (enrollmentRepository.existsByStudentIdAndCourseId(currentUser.getId(), course.getId())) {
            return mapToAssignmentResponse(assignment);
        } else {
            throw new IllegalArgumentException("You don't have access to this assignment");
        }
    }

    @Override
    @Transactional
    public AssignmentSubmissionResponse submitAssignment(Long assignmentId, SubmitAssignmentRequest request) {
        User student = getCurrentUser();
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new UserNotFoundException("Assignment not found"));

        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), assignment.getCourse().getId())) {
            throw new IllegalArgumentException("You are not enrolled in this course");
        }

        if (assignmentSubmissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId()).isPresent()) {
            throw new IllegalArgumentException("You have already submitted this assignment");
        }

        AssignmentSubmission submission = AssignmentSubmission.builder()
                .assignment(assignment)
                .student(student)
                .submission(request.getSubmission())
                .build();

        AssignmentSubmission saved = assignmentSubmissionRepository.save(submission);
        return mapToSubmissionResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentSubmissionResponse> getSubmissionsForAssignment(Long assignmentId) {
        User mentor = getCurrentUser();
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new UserNotFoundException("Assignment not found"));

        if (!assignment.getCourse().getMentor().getId().equals(mentor.getId())) {
            throw new IllegalArgumentException("You are not the owner of this assignment");
        }

        return assignmentSubmissionRepository.findByAssignmentId(assignmentId)
                .stream()
                .map(this::mapToSubmissionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentSubmissionResponse getSubmissionForStudent(Long assignmentId) {
        User student = getCurrentUser();
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new UserNotFoundException("Assignment not found"));

        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), assignment.getCourse().getId())) {
            throw new IllegalArgumentException("You are not enrolled in this course");
        }

        return assignmentSubmissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .map(this::mapToSubmissionResponse)
                .orElse(null);
    }

    @Override
    @Transactional
    public AssignmentSubmissionResponse gradeAssignment(Long submissionId, GradeAssignmentRequest request) {
        User mentor = getCurrentUser();
        AssignmentSubmission submission = assignmentSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new UserNotFoundException("Submission not found"));

        if (!submission.getAssignment().getCourse().getMentor().getId().equals(mentor.getId())) {
            throw new IllegalArgumentException("You are not the owner of this assignment");
        }

        submission.setGrade(request.getGrade());
        submission.setFeedback(request.getFeedback());
        submission.setGradedAt(LocalDateTime.now());
        submission.setGradedBy(mentor);

        AssignmentSubmission saved = assignmentSubmissionRepository.save(submission);
        
        // Send notification to student about graded assignment
        notificationService.createNotification(
                submission.getStudent(),
                "Assignment Graded",
                "Your assignment '" + submission.getAssignment().getTitle() + "' has been graded. Score: " + request.getGrade(),
                "#assignments",
                true // Send email for important event
        );
        
        return mapToSubmissionResponse(saved);
    }
}
