package com.skillsphere.service.impl;

import com.skillsphere.dto.AdminCourseReviewCourse;
import com.skillsphere.dto.AdminCourseReviewLesson;
import com.skillsphere.dto.AdminCourseReviewModule;
import com.skillsphere.dto.AdminCourseReviewResource;
import com.skillsphere.dto.AdminCourseReviewResponse;
import com.skillsphere.dto.CourseDetailsResponse;
import com.skillsphere.dto.CourseRequest;
import com.skillsphere.dto.CourseResponse;
import com.skillsphere.dto.InstructorProfileResponse;
import com.skillsphere.entity.Course;
import com.skillsphere.entity.CourseModule;
import com.skillsphere.entity.Lesson;
import com.skillsphere.entity.Resource;
import com.skillsphere.entity.User;
import com.skillsphere.enums.CourseStatus;
import com.skillsphere.exception.BusinessConflictException;
import com.skillsphere.exception.CourseSubmissionValidationException;
import com.skillsphere.exception.UserNotFoundException;
import com.skillsphere.repository.CourseModuleRepository;
import com.skillsphere.repository.CourseRepository;
import com.skillsphere.repository.EnrollmentRepository;
import com.skillsphere.repository.LessonRepository;
import com.skillsphere.repository.ResourceRepository;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import com.skillsphere.entity.Enrollment;
import com.skillsphere.enums.Role;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final com.skillsphere.service.NotificationService notificationService;
    private final com.skillsphere.service.AuditLogService auditLogService;

    private User getCurrentUserOptional() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            if (email == null || email.equals("anonymousUser")) return null;
            return userRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private Course getMentorOwnedCourse(Long courseId, User mentor) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new UserNotFoundException("Course not found"));

        if (!course.getMentor().getId().equals(mentor.getId())) {
            throw new AccessDeniedException("You are not authorized to access this course");
        }

        return course;
    }

    private void validateCourseEditableByMentor(Course course) {
        if (course.getStatus() != CourseStatus.DRAFT && course.getStatus() != CourseStatus.REJECTED) {
            throw new BusinessConflictException("Only draft or rejected courses can be edited");
        }
    }

    private void validateCourseSubmittableByMentor(Course course) {
        if (course.getStatus() != CourseStatus.DRAFT && course.getStatus() != CourseStatus.REJECTED) {
            throw new BusinessConflictException("Only draft or rejected courses can be submitted for approval");
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private void validateCourseReadinessForSubmission(Course course) {
        Map<String, String> errors = new LinkedHashMap<>();

        if (!hasText(course.getTitle())) {
            errors.put("title", "Course title is required before submission.");
        }

        if (!hasText(course.getShortDescription())) {
            errors.put("shortDescription", "Short description is required before submission.");
        }

        if (!hasText(course.getDescription())) {
            errors.put("description", "Course description is required before submission.");
        }

        if (!hasText(course.getCategory())) {
            errors.put("category", "Course category is required before submission.");
        }

        if (!hasText(course.getLevel())) {
            errors.put("level", "Course difficulty is required before submission.");
        }

        if (!hasText(course.getLanguage())) {
            errors.put("language", "Course language is required before submission.");
        }

        if (!hasText(course.getEstimatedDuration())) {
            errors.put("estimatedDuration", "Estimated duration is required before submission.");
        }

        if (course.getEstimatedLearningHours() == null || course.getEstimatedLearningHours() <= 0) {
            errors.put("estimatedLearningHours", "Estimated learning hours must be a positive number before submission.");
        }

        if (!hasText(course.getThumbnailUrl())) {
            errors.put("thumbnailUrl", "Thumbnail URL is required before submission.");
        }

        if (!hasText(course.getBannerUrl())) {
            errors.put("bannerUrl", "Banner URL is required before submission.");
        }

        if (!hasText(course.getPrerequisites())) {
            errors.put("prerequisites", "Prerequisites are required before submission.");
        }

        if (!hasText(course.getTargetAudience())) {
            errors.put("targetAudience", "Target audience is required before submission.");
        }

        if (!hasText(course.getLearningOutcomes())) {
            errors.put("learningOutcomes", "Learning outcomes are required before submission.");
        }

        if (!hasText(course.getSkills())) {
            errors.put("skills", "Skills covered are required before submission.");
        }

        if (!hasText(course.getTags())) {
            errors.put("tags", "Tags are required before submission.");
        }

        if (course.getCertificateAvailable() == null) {
            errors.put("certificateAvailable", "Certificate availability must be specified before submission.");
        }

        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByOrderIndexAscIdAsc(course.getId());
        if (modules.isEmpty()) {
            errors.put("modules", "At least one module is required before submission.");
        }

        boolean hasAtLeastOneValidLesson = false;
        for (int moduleIndex = 0; moduleIndex < modules.size(); moduleIndex++) {
            CourseModule module = modules.get(moduleIndex);
            List<Lesson> lessons = lessonRepository.findByModuleIdOrderByOrderIndexAscIdAsc(module.getId());

            if (lessons.isEmpty()) {
                errors.put("module_" + moduleIndex + "_lessons",
                        "Module \"" + module.getTitle() + "\" must contain at least one lesson.");
                continue;
            }

            for (int lessonIndex = 0; lessonIndex < lessons.size(); lessonIndex++) {
                Lesson lesson = lessons.get(lessonIndex);
                boolean validTitle = hasText(lesson.getTitle());
                boolean validDuration = hasText(lesson.getEstimatedDuration());
                boolean validLessonType = hasText(lesson.getLessonType());
                boolean validVideo = !"VIDEO".equalsIgnoreCase(lesson.getLessonType()) || hasText(lesson.getVideoUrl());
                boolean validContent = "VIDEO".equalsIgnoreCase(lesson.getLessonType()) || hasText(lesson.getContent());

                if (validTitle && validDuration && validLessonType && validVideo && validContent) {
                    hasAtLeastOneValidLesson = true;
                    continue;
                }

                String lessonName = hasText(lesson.getTitle())
                        ? lesson.getTitle()
                        : "Lesson " + (lessonIndex + 1);
                errors.put(
                        "module_" + moduleIndex + "_lesson_" + lessonIndex,
                        "Lesson \"" + lessonName + "\" in module \"" + module.getTitle()
                                + "\" is incomplete. Ensure title, type, duration, and content are filled before submission."
                );
            }
        }

        if (!hasAtLeastOneValidLesson) {
            errors.put("lessons", "At least one valid lesson is required before submission.");
        }

        if (!errors.isEmpty()) {
            throw new CourseSubmissionValidationException("Course is not ready for submission", errors);
        }
    }

    @Override
    @Transactional
    public CourseResponse createDraftCourse(CourseRequest request, User mentor) {
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .category(request.getCategory())
                .level(request.getLevel())
                .language(request.getLanguage())
                .thumbnailUrl(request.getThumbnailUrl())
                .bannerUrl(resolveBannerUrl(request))
                .promotionalVideoUrl(request.getPromotionalVideoUrl())
                .introVideoUrl(request.getIntroVideoUrl())
                .estimatedDuration(request.getEstimatedDuration())
                .estimatedLearningHours(request.getEstimatedLearningHours())
                .prerequisites(request.getPrerequisites())
                .targetAudience(request.getTargetAudience())
                .learningOutcomes(request.getLearningOutcomes())
                .skills(request.getSkills())
                .averageRating(resolveAverageRating(request.getAverageRating()))
                .certificateAvailable(resolveCertificateAvailability(request.getCertificateAvailable()))
                .tags(resolveTags(request))
                .price(request.getPrice() != null ? request.getPrice() : 0.0)
                .mentor(mentor)
                .status(CourseStatus.DRAFT)
                .build();

        Course saved = courseRepository.save(course);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse getMentorCourseById(Long id, User mentor) {
        return mapToResponse(getMentorOwnedCourse(id, mentor));
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request, User mentor) {
        Course course = getMentorOwnedCourse(id, mentor);

        validateCourseEditableByMentor(course);

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setShortDescription(request.getShortDescription());
        course.setCategory(request.getCategory());
        course.setLevel(request.getLevel());
        course.setLanguage(request.getLanguage());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setBannerUrl(resolveBannerUrlForUpdate(request, course));
        course.setPromotionalVideoUrl(request.getPromotionalVideoUrl());
        course.setIntroVideoUrl(request.getIntroVideoUrl());
        course.setEstimatedDuration(request.getEstimatedDuration());
        course.setEstimatedLearningHours(request.getEstimatedLearningHours());
        course.setPrerequisites(request.getPrerequisites());
        course.setTargetAudience(request.getTargetAudience());
        course.setLearningOutcomes(request.getLearningOutcomes());
        course.setSkills(request.getSkills());
        course.setAverageRating(request.getAverageRating() != null ? request.getAverageRating() : course.getAverageRating());
        course.setCertificateAvailable(
                request.getCertificateAvailable() != null ? request.getCertificateAvailable() : course.getCertificateAvailable()
        );
        course.setTags(resolveTagsForUpdate(request, course));
        if (request.getPrice() != null) {
            course.setPrice(request.getPrice());
        }

        Course saved = courseRepository.save(course);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteDraftCourse(Long id, User mentor) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Course not found"));

        if (!course.getMentor().getId().equals(mentor.getId()) && !Role.ADMIN.equals(mentor.getRole())) {
            throw new AccessDeniedException("You do not have permission to delete this course");
        }

        // 1. Delete all enrollments for this course
        try {
            List<Enrollment> enrollments = enrollmentRepository.findByCourseId(id);
            if (enrollments != null && !enrollments.isEmpty()) {
                enrollmentRepository.deleteAll(enrollments);
            }
        } catch (Exception e) {
            log.warn("Error deleting enrollments for course {}: {}", id, e.getMessage());
        }

        // 2. Delete modules, lessons, and resources
        try {
            List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByOrderIndexAscIdAsc(id);
            for (CourseModule module : modules) {
                List<Lesson> lessons = lessonRepository.findByModuleIdOrderByOrderIndexAscIdAsc(module.getId());
                for (Lesson lesson : lessons) {
                    List<Resource> resources = resourceRepository.findByLessonIdOrderByOrderIndexAscIdAsc(lesson.getId());
                    if (resources != null && !resources.isEmpty()) {
                        resourceRepository.deleteAll(resources);
                    }
                }
                if (lessons != null && !lessons.isEmpty()) {
                    lessonRepository.deleteAll(lessons);
                }
            }
            if (modules != null && !modules.isEmpty()) {
                courseModuleRepository.deleteAll(modules);
            }
        } catch (Exception e) {
            log.warn("Error deleting modules for course {}: {}", id, e.getMessage());
        }

        // 3. Delete the course itself
        courseRepository.delete(course);
        log.info("Course id {} permanently deleted by user {}", id, mentor.getEmail());
    }

    @Override
    @Transactional
    public CourseResponse submitForApproval(Long id, User mentor) {
        Course course = getMentorOwnedCourse(id, mentor);

        validateCourseSubmittableByMentor(course);
        validateCourseReadinessForSubmission(course);

        course.setStatus(CourseStatus.SUBMITTED);
        course.setRejectionReason(null);
        course.setReviewedBy(null);
        course.setReviewedAt(null);
        Course saved = courseRepository.save(course);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CourseResponse publishCourse(Long id, User mentor) {
        Course course = getMentorOwnedCourse(id, mentor);

        if (course.getStatus() != CourseStatus.APPROVED) {
            throw new BusinessConflictException("Only approved courses can be published");
        }

        course.setStatus(CourseStatus.PUBLISHED);
        course.setPublishedAt(java.time.LocalDateTime.now());
        Course saved = courseRepository.save(course);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CourseResponse withdrawSubmission(Long id, User mentor) {
        Course course = getMentorOwnedCourse(id, mentor);

        if (course.getStatus() != CourseStatus.SUBMITTED && course.getStatus() != CourseStatus.UNDER_REVIEW) {
            throw new BusinessConflictException("Only submitted or under review courses can be withdrawn");
        }

        course.setStatus(CourseStatus.DRAFT);
        Course saved = courseRepository.save(course);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CourseResponse duplicateCourse(Long id, User mentor) {
        Course original = getMentorOwnedCourse(id, mentor);

        Course duplicate = Course.builder()
                .title("Copy of " + original.getTitle())
                .description(original.getDescription())
                .shortDescription(original.getShortDescription())
                .category(original.getCategory())
                .level(original.getLevel())
                .language(original.getLanguage())
                .thumbnailUrl(original.getThumbnailUrl())
                .bannerUrl(original.getBannerUrl())
                .promotionalVideoUrl(original.getPromotionalVideoUrl())
                .introVideoUrl(original.getIntroVideoUrl())
                .estimatedDuration(original.getEstimatedDuration())
                .estimatedLearningHours(original.getEstimatedLearningHours())
                .prerequisites(original.getPrerequisites())
                .targetAudience(original.getTargetAudience())
                .learningOutcomes(original.getLearningOutcomes())
                .skills(original.getSkills())
                .averageRating(0.0)
                .certificateAvailable(original.getCertificateAvailable())
                .tags(original.getTags())
                .mentor(mentor)
                .status(CourseStatus.DRAFT)
                .build();

        Course savedCourse = courseRepository.save(duplicate);

        List<CourseModule> oldModules = courseModuleRepository.findByCourseIdOrderByOrderIndexAscIdAsc(original.getId());
        for (CourseModule oldModule : oldModules) {
            CourseModule newModule = CourseModule.builder()
                    .course(savedCourse)
                    .title(oldModule.getTitle())
                    .description(oldModule.getDescription())
                    .orderIndex(oldModule.getOrderIndex())
                    .lessons(new java.util.ArrayList<>())
                    .build();
            CourseModule savedModule = courseModuleRepository.save(newModule);

            List<Lesson> oldLessons = lessonRepository.findByModuleIdOrderByOrderIndexAscIdAsc(oldModule.getId());
            for (Lesson oldLesson : oldLessons) {
                Lesson newLesson = Lesson.builder()
                        .module(savedModule)
                        .title(oldLesson.getTitle())
                        .content(oldLesson.getContent())
                        .orderIndex(oldLesson.getOrderIndex())
                        .estimatedDuration(oldLesson.getEstimatedDuration())
                        .lessonType(oldLesson.getLessonType())
                        .videoUrl(oldLesson.getVideoUrl())
                        .previewAvailable(oldLesson.getPreviewAvailable())
                        .mandatory(oldLesson.getMandatory())
                        .resources(new java.util.ArrayList<>())
                        .build();
                Lesson savedLesson = lessonRepository.save(newLesson);

                List<Resource> oldResources = resourceRepository.findByLessonIdOrderByOrderIndexAscIdAsc(oldLesson.getId());
                for (Resource oldResource : oldResources) {
                    Resource newResource = Resource.builder()
                            .lesson(savedLesson)
                            .title(oldResource.getTitle())
                            .description(oldResource.getDescription())
                            .url(oldResource.getUrl())
                            .type(oldResource.getType())
                            .orderIndex(oldResource.getOrderIndex())
                            .build();
                    resourceRepository.save(newResource);
                }
            }
        }

        return mapToResponse(savedCourse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getMentorCourses(User mentor) {
        if (mentor != null && Role.ADMIN.equals(mentor.getRole())) {
            return courseRepository.findAll().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        List<Course> courses = courseRepository.findByMentor(mentor);
        if (courses.isEmpty()) {
            return courseRepository.findAll().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return courses.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getPendingApprovalCourses() {
        return courseRepository.findByStatusIn(List.of(CourseStatus.SUBMITTED, CourseStatus.UNDER_REVIEW)).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getCoursesByStatus(CourseStatus status) {
        if (status == CourseStatus.APPROVED || status == CourseStatus.PUBLISHED) {
            return courseRepository.findByStatusIn(List.of(CourseStatus.APPROVED, CourseStatus.PUBLISHED)).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        if (status == CourseStatus.SUBMITTED || status == CourseStatus.UNDER_REVIEW) {
            return courseRepository.findByStatusIn(List.of(CourseStatus.SUBMITTED, CourseStatus.UNDER_REVIEW)).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return courseRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CourseResponse approveCourse(Long id, User admin) {
        log.info("Starting course approval for courseId: {} by admin: {}", id, admin != null ? admin.getEmail() : "unknown");

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Course not found with id: " + id));

        log.info("Course found: '{}', current status: {}", course.getTitle(), course.getStatus());

        if (course.getStatus() == CourseStatus.ARCHIVED) {
            log.warn("Cannot approve archived courseId: {}", id);
            throw new BusinessConflictException("Archived courses cannot be approved");
        }

        course.setStatus(CourseStatus.PUBLISHED);
        course.setPublishedAt(LocalDateTime.now());
        course.setRejectionReason(null);
        course.setReviewedBy(admin);
        course.setReviewedAt(LocalDateTime.now());

        Course saved = courseRepository.save(course);
        log.info("Course approval saved in DB successfully. CourseId: {}, New Status: {}, AdminId: {}", saved.getId(), saved.getStatus(), admin != null ? admin.getId() : null);

        auditLogService.logAction(
                "COURSE_APPROVED",
                admin != null ? admin.getEmail() : "SYSTEM",
                saved.getMentor() != null ? saved.getMentor().getEmail() : null,
                saved.getTitle(),
                "Approved course '" + saved.getTitle() + "' (ID: " + saved.getId() + ")",
                null
        );

        // Send notification to mentor
        try {
            if (saved.getMentor() != null) {
                notificationService.createNotification(
                        saved.getMentor(),
                        "Course Approved",
                        "Your course '" + saved.getTitle() + "' has been approved.",
                        "#courses",
                        true
                );
                log.info("Approval notification dispatched to mentor: {}", saved.getMentor().getEmail());
            }
        } catch (Exception e) {
            log.error("Notification dispatch failed for approved courseId: {}, continuing...", id, e);
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CourseResponse rejectCourse(Long id, String reason, User admin) {
        log.info("Starting course rejection for courseId: {} by admin: {}, reason: {}", id, admin != null ? admin.getEmail() : "unknown", reason);

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Course not found with id: " + id));

        log.info("Course found: '{}', current status: {}", course.getTitle(), course.getStatus());

        if (course.getStatus() == CourseStatus.ARCHIVED) {
            log.warn("Cannot reject archived courseId: {}", id);
            throw new BusinessConflictException("Archived courses cannot be rejected");
        }

        course.setStatus(CourseStatus.REJECTED);
        course.setRejectionReason(reason);
        course.setReviewedBy(admin);
        course.setReviewedAt(LocalDateTime.now());

        Course saved = courseRepository.save(course);
        log.info("Course rejection saved in DB successfully. CourseId: {}, New Status: {}, Reason: {}", saved.getId(), saved.getStatus(), saved.getRejectionReason());

        auditLogService.logAction(
                "COURSE_REJECTED",
                admin != null ? admin.getEmail() : "SYSTEM",
                saved.getMentor() != null ? saved.getMentor().getEmail() : null,
                saved.getTitle(),
                "Rejected course '" + saved.getTitle() + "' (ID: " + saved.getId() + "). Reason: " + reason,
                null
        );

        try {
            if (saved.getMentor() != null) {
                notificationService.createNotification(
                        saved.getMentor(),
                        "Course Rejected",
                        "Your course '" + saved.getTitle() + "' was rejected. Reason: " + reason,
                        "#courses",
                        true
                );
                log.info("Rejection notification dispatched to mentor: {}", saved.getMentor().getEmail());
            }
        } catch (Exception e) {
            log.error("Notification dispatch failed for rejected courseId: {}, continuing...", id, e);
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CourseResponse requestChanges(Long id, String reason, User admin) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Course not found"));

        if (course.getStatus() != CourseStatus.SUBMITTED && course.getStatus() != CourseStatus.UNDER_REVIEW) {
            throw new BusinessConflictException("Only courses submitted or under review can have changes requested");
        }

        course.setStatus(CourseStatus.REJECTED);
        course.setRejectionReason(reason);
        course.setReviewedBy(admin);
        course.setReviewedAt(LocalDateTime.now());
        Course saved = courseRepository.save(course);

        notificationService.createNotification(
                course.getMentor(),
                "Changes Requested",
                "Changes were requested for your course '" + course.getTitle() + "'. Feedback: " + reason,
                "#courses",
                true
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CourseResponse publishCourseAsAdmin(Long id, User admin) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Course not found"));

        if (course.getStatus() == CourseStatus.ARCHIVED) {
            throw new BusinessConflictException("Archived courses cannot be published");
        }

        course.setStatus(CourseStatus.PUBLISHED);
        course.setPublishedAt(LocalDateTime.now());
        course.setReviewedBy(admin);
        course.setReviewedAt(LocalDateTime.now());
        Course saved = courseRepository.save(course);

        notificationService.createNotification(
                course.getMentor(),
                "Course Published",
                "Your course '" + course.getTitle() + "' has been published.",
                "#courses",
                true
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CourseResponse archiveCourse(Long id, User admin) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Course not found"));

        if (course.getStatus() == CourseStatus.ARCHIVED) {
            throw new BusinessConflictException("Course is already archived");
        }

        course.setStatus(CourseStatus.ARCHIVED);
        course.setReviewedBy(admin);
        course.setReviewedAt(LocalDateTime.now());
        Course saved = courseRepository.save(course);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AdminCourseReviewResponse getAdminCourseReviewById(Long id, User admin) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Course not found"));

        if (course.getStatus() == CourseStatus.SUBMITTED) {
            course.setStatus(CourseStatus.UNDER_REVIEW);
            course = courseRepository.save(course);
        }

        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByOrderIndexAscIdAsc(course.getId());
        List<AdminCourseReviewModule> moduleDtos = modules.stream()
                .map(module -> {
                    List<Lesson> lessons = lessonRepository.findByModuleIdOrderByOrderIndexAscIdAsc(module.getId());
                    List<AdminCourseReviewLesson> lessonDtos = lessons.stream()
                            .map(lesson -> {
                                List<Resource> resources = resourceRepository.findByLessonIdOrderByOrderIndexAscIdAsc(lesson.getId());
                                List<AdminCourseReviewResource> resourceDtos = resources.stream()
                                        .map(resource -> AdminCourseReviewResource.builder()
                                                .title(resource.getTitle())
                                                .description(resource.getDescription())
                                                .url(resource.getUrl())
                                                .type(resource.getType())
                                                .orderIndex(resource.getOrderIndex())
                                                .build())
                                        .collect(Collectors.toList());

                                return AdminCourseReviewLesson.builder()
                                        .title(lesson.getTitle())
                                        .content(lesson.getContent())
                                        .orderIndex(lesson.getOrderIndex())
                                        .estimatedDuration(lesson.getEstimatedDuration())
                                        .lessonType(lesson.getLessonType())
                                        .videoUrl(lesson.getVideoUrl())
                                        .previewAvailable(lesson.getPreviewAvailable())
                                        .mandatory(lesson.getMandatory())
                                        .resources(resourceDtos)
                                        .build();
                            })
                            .collect(Collectors.toList());

                    return AdminCourseReviewModule.builder()
                            .title(module.getTitle())
                            .description(module.getDescription())
                            .orderIndex(module.getOrderIndex())
                            .lessons(lessonDtos)
                            .build();
                })
                .collect(Collectors.toList());

        AdminCourseReviewCourse courseDto = AdminCourseReviewCourse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .shortDescription(course.getShortDescription())
                .category(course.getCategory())
                .level(course.getLevel())
                .language(course.getLanguage())
                .thumbnailUrl(course.getThumbnailUrl())
                .bannerUrl(course.getBannerUrl())
                .promotionalVideoUrl(course.getPromotionalVideoUrl())
                .introVideoUrl(course.getIntroVideoUrl())
                .estimatedDuration(course.getEstimatedDuration())
                .estimatedLearningHours(course.getEstimatedLearningHours())
                .prerequisites(course.getPrerequisites())
                .targetAudience(course.getTargetAudience())
                .learningOutcomes(course.getLearningOutcomes())
                .skills(course.getSkills())
                .mentorName(course.getMentor().getFullName())
                .mentorEmail(course.getMentor().getEmail())
                .status(course.getStatus())
                .rejectionReason(course.getRejectionReason())
                .reviewerName(course.getReviewedBy() != null ? course.getReviewedBy().getFullName() : null)
                .reviewerEmail(course.getReviewedBy() != null ? course.getReviewedBy().getEmail() : null)
                .reviewedAt(course.getReviewedAt())
                .approvedBy(course.getReviewedBy() != null ? course.getReviewedBy().getFullName() : null)
                .approvedAt(course.getReviewedAt() != null ? course.getReviewedAt() : course.getPublishedAt())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .publishedAt(course.getPublishedAt())
                .price(course.getPrice())
                .build();

        return AdminCourseReviewResponse.builder()
                .course(courseDto)
                .modules(moduleDtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getPublishedCourses() {
        return courseRepository.findByStatusIn(List.of(CourseStatus.APPROVED, CourseStatus.PUBLISHED)).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> searchPublishedCourses(String search, String category) {
        List<CourseStatus> visibleStatuses = List.of(CourseStatus.APPROVED, CourseStatus.PUBLISHED);
        if (search != null && !search.isBlank() && category != null && !category.isBlank()) {
            return courseRepository.searchCoursesWithCategory(search, category, visibleStatuses)
                    .stream().map(this::mapToResponse).collect(Collectors.toList());
        } else if (search != null && !search.isBlank()) {
            return courseRepository.searchCourses(search, visibleStatuses)
                    .stream().map(this::mapToResponse).collect(Collectors.toList());
        } else if (category != null && !category.isBlank()) {
            return courseRepository.findByCategoryContainingIgnoreCaseAndStatusIn(category, visibleStatuses)
                    .stream().map(this::mapToResponse).collect(Collectors.toList());
        } else {
            return getPublishedCourses();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findByIdAndStatusIn(id, List.of(CourseStatus.APPROVED, CourseStatus.PUBLISHED))
                .orElseThrow(() -> new UserNotFoundException("Course not found"));
        return mapToResponse(course);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDetailsResponse getCourseDetailsById(Long id) {
        Course course = courseRepository.findByIdAndStatusIn(id, List.of(CourseStatus.APPROVED, CourseStatus.PUBLISHED))
                .orElseThrow(() -> new UserNotFoundException("Course not found"));
        return mapToDetailsResponse(course);
    }

    private String resolveBannerUrl(CourseRequest request) {
        if (hasText(request.getBannerUrl())) {
            return request.getBannerUrl().trim();
        }
        return request.getThumbnailUrl();
    }

    private String resolveBannerUrlForUpdate(CourseRequest request, Course course) {
        if (hasText(request.getBannerUrl())) {
            return request.getBannerUrl().trim();
        }
        if (hasText(request.getThumbnailUrl())) {
            return request.getThumbnailUrl().trim();
        }
        return course.getBannerUrl();
    }

    private Double resolveAverageRating(Double averageRating) {
        return averageRating != null ? averageRating : 0.0;
    }

    private Boolean resolveCertificateAvailability(Boolean certificateAvailable) {
        return certificateAvailable != null ? certificateAvailable : Boolean.TRUE;
    }

    private String resolveTags(CourseRequest request) {
        if (hasText(request.getTags())) {
            return request.getTags();
        }
        return request.getSkills();
    }

    private String resolveTagsForUpdate(CourseRequest request, Course course) {
        if (hasText(request.getTags())) {
            return request.getTags();
        }
        if (hasText(request.getSkills())) {
            return request.getSkills();
        }
        return course.getTags();
    }

    private CourseDetailsResponse mapToDetailsResponse(Course course) {
        User currentUser = getCurrentUserOptional();
        Boolean enrolled = Boolean.FALSE;
        Long enrollmentId = null;
        int moduleCount = (int) courseModuleRepository.countByCourseId(course.getId());
        int lessonCount = (int) lessonRepository.countByModuleCourseId(course.getId());
        long enrollmentCount = enrollmentRepository.countByCourseId(course.getId());

        if (currentUser != null) {
            Optional<com.skillsphere.entity.Enrollment> enrollmentOpt =
                    enrollmentRepository.findByStudentIdAndCourseId(currentUser.getId(), course.getId());
            enrolled = enrollmentOpt.isPresent();
            enrollmentId = enrollmentOpt.map(com.skillsphere.entity.Enrollment::getId).orElse(null);
        }

        return CourseDetailsResponse.builder()
                .id(course.getId())
                .bannerUrl(firstNonBlank(course.getBannerUrl(), course.getThumbnailUrl()))
                .thumbnailUrl(course.getThumbnailUrl())
                .promotionalVideoUrl(course.getPromotionalVideoUrl())
                .introVideoUrl(course.getIntroVideoUrl())
                .title(course.getTitle())
                .shortDescription(firstNonBlank(course.getShortDescription(), course.getDescription()))
                .description(course.getDescription())
                .instructor(course.getMentor().getFullName())
                .instructorProfile(InstructorProfileResponse.builder()
                        .id(course.getMentor().getId())
                        .fullName(course.getMentor().getFullName())
                        .email(course.getMentor().getEmail())
                        .department(course.getMentor().getDepartment())
                        .college(course.getMentor().getCollege())
                        .profileImage(course.getMentor().getProfileImage())
                        .build())
                .learningOutcomes(course.getLearningOutcomes())
                .prerequisites(course.getPrerequisites())
                .skillsCovered(course.getSkills())
                .duration(firstNonBlank(course.getEstimatedDuration(), "Self-paced"))
                .estimatedLearningHours(course.getEstimatedLearningHours())
                .lessonCount(lessonCount)
                .moduleCount(moduleCount)
                .difficulty(course.getLevel())
                .language(firstNonBlank(course.getLanguage(), "English"))
                .category(course.getCategory())
                .enrollmentCount(enrollmentCount)
                .rating(course.getAverageRating())
                .lastUpdated(course.getUpdatedAt() != null ? course.getUpdatedAt() : course.getPublishedAt())
                .certificateAvailable(resolveCertificateAvailability(course.getCertificateAvailable()))
                .tags(course.getTags())
                .enrolled(enrolled)
                .enrollmentId(enrollmentId)
                .price(course.getPrice())
                .build();
    }

    private String firstNonBlank(String primary, String fallback) {
        if (hasText(primary)) {
            return primary.trim();
        }
        return fallback;
    }

    private CourseResponse mapToResponse(Course course) {
        User currentUser = getCurrentUserOptional();
        Boolean enrolled = null;
        Long enrollmentId = null;
        int moduleCount = (int) courseModuleRepository.countByCourseId(course.getId());
        int lessonCount = (int) lessonRepository.countByModuleCourseId(course.getId());
        long enrollmentCount = enrollmentRepository.countByCourseId(course.getId());
        
        if (currentUser != null) {
            Optional<com.skillsphere.entity.Enrollment> enrollmentOpt = 
                    enrollmentRepository.findByStudentIdAndCourseId(currentUser.getId(), course.getId());
            enrolled = enrollmentOpt.isPresent();
            enrollmentId = enrollmentOpt.map(com.skillsphere.entity.Enrollment::getId).orElse(null);
        }
        
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .shortDescription(course.getShortDescription())
                .category(course.getCategory())
                .level(course.getLevel())
                .language(course.getLanguage())
                .thumbnailUrl(course.getThumbnailUrl())
                .bannerUrl(course.getBannerUrl())
                .promotionalVideoUrl(course.getPromotionalVideoUrl())
                .introVideoUrl(course.getIntroVideoUrl())
                .estimatedDuration(course.getEstimatedDuration())
                .estimatedLearningHours(course.getEstimatedLearningHours())
                .prerequisites(course.getPrerequisites())
                .targetAudience(course.getTargetAudience())
                .learningOutcomes(course.getLearningOutcomes())
                .skills(course.getSkills())
                .mentorId(course.getMentor().getId())
                .mentorName(course.getMentor().getFullName())
                .mentorEmail(course.getMentor().getEmail())
                .status(course.getStatus())
                .rejectionReason(course.getRejectionReason())
                .reviewerName(course.getReviewedBy() != null ? course.getReviewedBy().getFullName() : null)
                .reviewerEmail(course.getReviewedBy() != null ? course.getReviewedBy().getEmail() : null)
                .reviewedAt(course.getReviewedAt())
                .approvedBy(course.getReviewedBy() != null ? course.getReviewedBy().getFullName() : null)
                .approvedAt(course.getReviewedAt() != null ? course.getReviewedAt() : course.getPublishedAt())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .publishedAt(course.getPublishedAt())
                .moduleCount(moduleCount)
                .lessonCount(lessonCount)
                .enrollmentCount(enrollmentCount)
                .enrolled(enrolled)
                .enrollmentId(enrollmentId)
                .price(course.getPrice())
                .build();
    }
}
