package com.skillsphere.service.impl;

import com.skillsphere.dto.CourseModuleRequest;
import com.skillsphere.dto.CourseModuleResponse;
import com.skillsphere.dto.LessonRequest;
import com.skillsphere.dto.LessonResponse;
import com.skillsphere.dto.ResourceRequest;
import com.skillsphere.dto.ResourceResponse;
import com.skillsphere.entity.Course;
import com.skillsphere.entity.CourseModule;
import com.skillsphere.entity.Lesson;
import com.skillsphere.entity.Resource;
import com.skillsphere.entity.User;
import com.skillsphere.enums.CourseStatus;
import com.skillsphere.exception.BusinessConflictException;
import com.skillsphere.exception.UserNotFoundException;
import com.skillsphere.repository.CourseModuleRepository;
import com.skillsphere.repository.CourseRepository;
import com.skillsphere.repository.EnrollmentRepository;
import com.skillsphere.repository.LessonRepository;
import com.skillsphere.repository.ResourceRepository;
import com.skillsphere.service.CourseContentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseContentServiceImpl implements CourseContentService {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final ResourceRepository resourceRepository;
    private final EnrollmentRepository enrollmentRepository;

    // ------------------------------
    // Helper Methods - Ownership & Access
    // ------------------------------

    private Course getCourseAndVerifyOwnership(Long courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new UserNotFoundException("Course not found"));

        if (user == null) {
            if (course.getStatus() != CourseStatus.PUBLISHED && course.getStatus() != CourseStatus.APPROVED) {
                throw new AccessDeniedException("Course is not available");
            }
            return course;
        }

        // If user is mentor, check if they own the course
        if (user.getRole() == com.skillsphere.enums.Role.MENTOR) {
            if (!course.getMentor().getId().equals(user.getId())) {
                throw new AccessDeniedException("You are not authorized to access this course");
            }
        }

        // If user is student, check if course is published or approved
        if (user.getRole() == com.skillsphere.enums.Role.STUDENT) {
            if (course.getStatus() != CourseStatus.PUBLISHED && course.getStatus() != CourseStatus.APPROVED) {
                throw new AccessDeniedException("Course is not available to students");
            }
        }

        return course;
    }

    private CourseModule getModuleAndVerifyOwnership(Long courseId, Long moduleId, User user) {
        Course course = getCourseAndVerifyOwnership(courseId, user);
        CourseModule module = moduleRepository.findByIdAndCourseId(moduleId, courseId)
                .orElseThrow(() -> new UserNotFoundException("Module not found"));
        return module;
    }

    private Lesson getLessonAndVerifyOwnership(Long courseId, Long moduleId, Long lessonId, User user) {
        CourseModule module = getModuleAndVerifyOwnership(courseId, moduleId, user);
        Lesson lesson = lessonRepository.findByIdAndModuleId(lessonId, moduleId)
                .orElseThrow(() -> new UserNotFoundException("Lesson not found"));
        return lesson;
    }

    private Resource getResourceAndVerifyOwnership(Long courseId, Long moduleId, Long lessonId, Long resourceId, User user) {
        Lesson lesson = getLessonAndVerifyOwnership(courseId, moduleId, lessonId, user);
        Resource resource = resourceRepository.findByIdAndLessonId(resourceId, lessonId)
                .orElseThrow(() -> new UserNotFoundException("Resource not found"));
        return resource;
    }

    private void validateMentorCanManageCourseContent(Course course, User mentor) {
        getCourseAndVerifyOwnership(course.getId(), mentor);

        if (course.getStatus() != CourseStatus.DRAFT && course.getStatus() != CourseStatus.REJECTED) {
            throw new BusinessConflictException("Course content can only be modified for draft or rejected courses");
        }
    }

    private List<CourseModule> getOrderedModules(Long courseId) {
        return new ArrayList<>(moduleRepository.findByCourseIdOrderByOrderIndexAscIdAsc(courseId));
    }

    private int clampModuleIndex(Integer requestedIndex, int maxIndex) {
        if (requestedIndex == null) {
            return maxIndex;
        }
        return Math.max(0, Math.min(requestedIndex, maxIndex));
    }

    private void resequenceModules(List<CourseModule> modules) {
        for (int i = 0; i < modules.size(); i++) {
            modules.get(i).setOrderIndex(i);
        }
        moduleRepository.saveAll(modules);
    }

    private List<Lesson> getOrderedLessons(Long moduleId) {
        return new ArrayList<>(lessonRepository.findByModuleIdOrderByOrderIndexAscIdAsc(moduleId));
    }

    private int clampLessonIndex(Integer requestedIndex, int maxIndex) {
        if (requestedIndex == null) {
            return maxIndex;
        }
        return Math.max(0, Math.min(requestedIndex, maxIndex));
    }

    private void resequenceLessons(List<Lesson> lessons) {
        for (int i = 0; i < lessons.size(); i++) {
            lessons.get(i).setOrderIndex(i);
        }
        lessonRepository.saveAll(lessons);
    }

    private List<Resource> getOrderedResources(Long lessonId) {
        return new ArrayList<>(resourceRepository.findByLessonIdOrderByOrderIndexAscIdAsc(lessonId));
    }

    private int clampResourceIndex(Integer requestedIndex, int maxIndex) {
        if (requestedIndex == null) {
            return maxIndex;
        }
        return Math.max(0, Math.min(requestedIndex, maxIndex));
    }

    private void resequenceResources(List<Resource> resources) {
        for (int i = 0; i < resources.size(); i++) {
            resources.get(i).setOrderIndex(i);
        }
        resourceRepository.saveAll(resources);
    }

    private String normalizeBlankToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeLessonType(String lessonType) {
        String normalized = normalizeBlankToNull(lessonType);
        return normalized == null ? "TEXT" : normalized.toUpperCase();
    }

    private String normalizeResourceType(String resourceType) {
        String normalized = normalizeBlankToNull(resourceType);
        return normalized == null ? null : normalized.toUpperCase();
    }

    private String normalizeAndValidateResourceUrl(String resourceUrl) {
        String normalized = normalizeBlankToNull(resourceUrl);
        if (normalized == null) {
            throw new IllegalArgumentException("Resource URL is required");
        }

        String lowerCaseUrl = normalized.toLowerCase();
        if (lowerCaseUrl.startsWith("file:")
                || lowerCaseUrl.startsWith("data:")
                || lowerCaseUrl.startsWith("javascript:")
                || normalized.matches("^[a-zA-Z]:\\\\.*")
                || normalized.startsWith("\\\\")) {
            throw new IllegalArgumentException("Resource URL must not expose local or executable filesystem paths");
        }

        try {
            URI uri = new URI(normalized);
            String scheme = uri.getScheme();
            if (scheme == null || (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme))) {
                throw new IllegalArgumentException("Resource URL must use http or https");
            }
        } catch (URISyntaxException ex) {
            throw new IllegalArgumentException("Resource URL is invalid");
        }

        return normalized;
    }

    private boolean canAccessLessonPreview(Lesson lesson, boolean includeProtectedContent) {
        return includeProtectedContent || Boolean.TRUE.equals(lesson.getPreviewAvailable());
    }

    // ------------------------------
    // Mappers (Entity -> DTO)
    // ------------------------------

    private ResourceResponse mapToResourceResponse(Resource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .lessonId(resource.getLesson().getId())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .url(resource.getUrl())
                .type(resource.getType())
                .orderIndex(resource.getOrderIndex())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }

    private boolean canAccessProtectedCourseContent(Course course, User user) {
        if (user == null) {
            return false;
        }

        if (user.getRole() == com.skillsphere.enums.Role.ADMIN) {
            return true;
        }

        if (user.getRole() == com.skillsphere.enums.Role.MENTOR) {
            return course.getMentor().getId().equals(user.getId());
        }

        return enrollmentRepository.existsByStudentIdAndCourseId(user.getId(), course.getId());
    }

    private LessonResponse mapToLessonResponse(Lesson lesson, boolean includeProtectedContent) {
        boolean canAccessLessonContent = canAccessLessonPreview(lesson, includeProtectedContent);
        List<ResourceResponse> resources = includeProtectedContent
                ? lesson.getResources().stream()
                .sorted(Comparator.comparing(CourseContentServiceImpl::getSafeResourceOrderIndex)
                        .thenComparing(CourseContentServiceImpl::getSafeResourceId))
                .map(this::mapToResourceResponse)
                .collect(Collectors.toList())
                : List.of();

        return LessonResponse.builder()
                .id(lesson.getId())
                .moduleId(lesson.getModule().getId())
                .title(lesson.getTitle())
                .content(canAccessLessonContent ? lesson.getContent() : null)
                .orderIndex(lesson.getOrderIndex())
                .estimatedDuration(lesson.getEstimatedDuration())
                .lessonType(lesson.getLessonType())
                .videoUrl(canAccessLessonContent ? lesson.getVideoUrl() : null)
                .previewAvailable(lesson.getPreviewAvailable())
                .mandatory(lesson.getMandatory())
                .resources(resources)
                .createdAt(lesson.getCreatedAt())
                .updatedAt(lesson.getUpdatedAt())
                .build();
    }

    private CourseModuleResponse mapToModuleResponse(CourseModule module, boolean includeProtectedContent) {
        List<LessonResponse> lessons = module.getLessons().stream()
                .sorted(Comparator.comparing(CourseContentServiceImpl::getSafeLessonOrderIndex)
                        .thenComparing(CourseContentServiceImpl::getSafeLessonId))
                .map(lesson -> mapToLessonResponse(lesson, includeProtectedContent))
                .collect(Collectors.toList());

        return CourseModuleResponse.builder()
                .id(module.getId())
                .courseId(module.getCourse().getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .orderIndex(module.getOrderIndex())
                .lessons(lessons)
                .createdAt(module.getCreatedAt())
                .updatedAt(module.getUpdatedAt())
                .build();
    }

    private static Integer getSafeLessonOrderIndex(Lesson lesson) {
        return lesson.getOrderIndex() == null ? Integer.MAX_VALUE : lesson.getOrderIndex();
    }

    private static Long getSafeLessonId(Lesson lesson) {
        return lesson.getId() == null ? Long.MAX_VALUE : lesson.getId();
    }

    private static Integer getSafeResourceOrderIndex(Resource resource) {
        return resource.getOrderIndex() == null ? Integer.MAX_VALUE : resource.getOrderIndex();
    }

    private static Long getSafeResourceId(Resource resource) {
        return resource.getId() == null ? Long.MAX_VALUE : resource.getId();
    }

    // ------------------------------
    // Course Module Methods
    // ------------------------------

    @Override
    @Transactional
    public CourseModuleResponse createModule(Long courseId, CourseModuleRequest request, User mentor) {
        Course course = getCourseAndVerifyOwnership(courseId, mentor);
        validateMentorCanManageCourseContent(course, mentor);

        List<CourseModule> modules = getOrderedModules(courseId);
        int targetIndex = clampModuleIndex(request.getOrderIndex(), modules.size());

        CourseModule module = CourseModule.builder()
                .course(course)
                .title(request.getTitle())
                .description(request.getDescription())
                .orderIndex(targetIndex)
                .lessons(new ArrayList<>())
                .build();

        modules.add(targetIndex, module);
        resequenceModules(modules);

        return mapToModuleResponse(modules.get(targetIndex), true);
    }

    @Override
    @Transactional
    public CourseModuleResponse updateModule(Long courseId, Long moduleId, CourseModuleRequest request, User mentor) {
        CourseModule module = getModuleAndVerifyOwnership(courseId, moduleId, mentor);
        validateMentorCanManageCourseContent(module.getCourse(), mentor);

        List<CourseModule> modules = getOrderedModules(courseId);
        modules.removeIf(existing -> existing.getId().equals(moduleId));
        int targetIndex = clampModuleIndex(request.getOrderIndex(), modules.size());

        module.setTitle(request.getTitle());
        module.setDescription(request.getDescription());
        modules.add(targetIndex, module);

        resequenceModules(modules);
        return mapToModuleResponse(module, true);
    }

    @Override
    @Transactional
    public void deleteModule(Long courseId, Long moduleId, User mentor) {
        CourseModule module = getModuleAndVerifyOwnership(courseId, moduleId, mentor);
        validateMentorCanManageCourseContent(module.getCourse(), mentor);

        if (lessonRepository.countByModuleId(moduleId) > 0) {
            throw new BusinessConflictException("Cannot delete a module that still contains lessons");
        }

        moduleRepository.delete(module);

        List<CourseModule> remainingModules = getOrderedModules(courseId);
        resequenceModules(remainingModules);
    }

    @Override
    @Transactional
    public List<CourseModuleResponse> reorderModules(Long courseId, List<Long> moduleIds, User mentor) {
        Course course = getCourseAndVerifyOwnership(courseId, mentor);
        validateMentorCanManageCourseContent(course, mentor);

        List<CourseModule> modules = getOrderedModules(courseId);
        if (moduleIds == null || moduleIds.size() != modules.size()) {
            throw new BusinessConflictException("Module reorder request must include every module exactly once");
        }

        if (new LinkedHashSet<>(moduleIds).size() != moduleIds.size()) {
            throw new BusinessConflictException("Module reorder request contains duplicate module ids");
        }

        Map<Long, CourseModule> moduleMap = modules.stream()
                .collect(Collectors.toMap(CourseModule::getId, Function.identity()));

        if (!moduleMap.keySet().equals(new LinkedHashSet<>(moduleIds))) {
            throw new BusinessConflictException("Module reorder request must match the modules in this course");
        }

        List<CourseModule> reorderedModules = moduleIds.stream()
                .map(moduleMap::get)
                .collect(Collectors.toList());
        resequenceModules(reorderedModules);

        return getModulesForCourse(courseId, mentor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseModuleResponse> getModulesForCourse(Long courseId, User user) {
        Course course = getCourseAndVerifyOwnership(courseId, user);
        boolean includeProtectedContent = canAccessProtectedCourseContent(course, user);
        List<CourseModule> modules = getOrderedModules(courseId);
        return modules.stream()
                .map(module -> mapToModuleResponse(module, includeProtectedContent))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CourseModuleResponse getModuleById(Long courseId, Long moduleId, User user) {
        CourseModule module = getModuleAndVerifyOwnership(courseId, moduleId, user);
        boolean includeProtectedContent = canAccessProtectedCourseContent(module.getCourse(), user);
        return mapToModuleResponse(module, includeProtectedContent);
    }

    // ------------------------------
    // Lesson Methods
    // ------------------------------

    @Override
    @Transactional
    public LessonResponse createLesson(Long courseId, Long moduleId, LessonRequest request, User mentor) {
        CourseModule module = getModuleAndVerifyOwnership(courseId, moduleId, mentor);
        validateMentorCanManageCourseContent(module.getCourse(), mentor);

        List<Lesson> lessons = getOrderedLessons(moduleId);
        int targetIndex = clampLessonIndex(request.getOrderIndex(), lessons.size());

        Lesson lesson = Lesson.builder()
                .module(module)
                .title(request.getTitle())
                .content(request.getContent())
                .orderIndex(targetIndex)
                .estimatedDuration(normalizeBlankToNull(request.getEstimatedDuration()))
                .lessonType(normalizeLessonType(request.getLessonType()))
                .videoUrl(normalizeBlankToNull(request.getVideoUrl()))
                .previewAvailable(Boolean.TRUE.equals(request.getPreviewAvailable()))
                .mandatory(Boolean.TRUE.equals(request.getMandatory()))
                .resources(new ArrayList<>())
                .build();

        lessons.add(targetIndex, lesson);
        resequenceLessons(lessons);

        return mapToLessonResponse(lessons.get(targetIndex), true);
    }

    @Override
    @Transactional
    public LessonResponse updateLesson(Long courseId, Long moduleId, Long lessonId, LessonRequest request, User mentor) {
        Lesson lesson = getLessonAndVerifyOwnership(courseId, moduleId, lessonId, mentor);
        validateMentorCanManageCourseContent(lesson.getModule().getCourse(), mentor);

        List<Lesson> lessons = getOrderedLessons(moduleId);
        lessons.removeIf(existing -> existing.getId().equals(lessonId));
        int targetIndex = clampLessonIndex(request.getOrderIndex(), lessons.size());

        lesson.setTitle(request.getTitle());
        lesson.setContent(request.getContent());
        lesson.setEstimatedDuration(normalizeBlankToNull(request.getEstimatedDuration()));
        lesson.setLessonType(normalizeLessonType(request.getLessonType()));
        lesson.setVideoUrl(normalizeBlankToNull(request.getVideoUrl()));
        lesson.setPreviewAvailable(Boolean.TRUE.equals(request.getPreviewAvailable()));
        lesson.setMandatory(Boolean.TRUE.equals(request.getMandatory()));

        lessons.add(targetIndex, lesson);
        resequenceLessons(lessons);

        return mapToLessonResponse(lesson, true);
    }

    @Override
    @Transactional
    public void deleteLesson(Long courseId, Long moduleId, Long lessonId, User mentor) {
        Lesson lesson = getLessonAndVerifyOwnership(courseId, moduleId, lessonId, mentor);
        validateMentorCanManageCourseContent(lesson.getModule().getCourse(), mentor);

        if (resourceRepository.countByLessonId(lessonId) > 0) {
            throw new BusinessConflictException("Cannot delete a lesson that still contains resources");
        }

        lessonRepository.delete(lesson);

        List<Lesson> remainingLessons = getOrderedLessons(moduleId);
        resequenceLessons(remainingLessons);
    }

    @Override
    @Transactional
    public List<LessonResponse> reorderLessons(Long courseId, Long moduleId, List<Long> lessonIds, User mentor) {
        CourseModule module = getModuleAndVerifyOwnership(courseId, moduleId, mentor);
        validateMentorCanManageCourseContent(module.getCourse(), mentor);

        List<Lesson> lessons = getOrderedLessons(moduleId);
        if (lessonIds == null || lessonIds.size() != lessons.size()) {
            throw new BusinessConflictException("Lesson reorder request must include every lesson exactly once");
        }

        if (new LinkedHashSet<>(lessonIds).size() != lessonIds.size()) {
            throw new BusinessConflictException("Lesson reorder request contains duplicate lesson ids");
        }

        Map<Long, Lesson> lessonMap = lessons.stream()
                .collect(Collectors.toMap(Lesson::getId, Function.identity()));

        if (!lessonMap.keySet().equals(new LinkedHashSet<>(lessonIds))) {
            throw new BusinessConflictException("Lesson reorder request must match the lessons in this module");
        }

        List<Lesson> reorderedLessons = lessonIds.stream()
                .map(lessonMap::get)
                .collect(Collectors.toList());
        resequenceLessons(reorderedLessons);

        return getLessonsForModule(courseId, moduleId, mentor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LessonResponse> getLessonsForModule(Long courseId, Long moduleId, User user) {
        CourseModule module = getModuleAndVerifyOwnership(courseId, moduleId, user);
        boolean includeProtectedContent = canAccessProtectedCourseContent(module.getCourse(), user);
        List<Lesson> lessons = getOrderedLessons(moduleId);
        return lessons.stream()
                .map(lesson -> mapToLessonResponse(lesson, includeProtectedContent))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LessonResponse getLessonById(Long courseId, Long moduleId, Long lessonId, User user) {
        Lesson lesson = getLessonAndVerifyOwnership(courseId, moduleId, lessonId, user);
        boolean includeProtectedContent = canAccessProtectedCourseContent(lesson.getModule().getCourse(), user);
        if (!canAccessLessonPreview(lesson, includeProtectedContent)) {
            throw new AccessDeniedException("Enroll in this course to access lesson content");
        }
        return mapToLessonResponse(lesson, includeProtectedContent);
    }

    // ------------------------------
    // Resource Methods
    // ------------------------------

    @Override
    @Transactional
    public ResourceResponse createResource(Long courseId, Long moduleId, Long lessonId, ResourceRequest request, User mentor) {
        Lesson lesson = getLessonAndVerifyOwnership(courseId, moduleId, lessonId, mentor);
        validateMentorCanManageCourseContent(lesson.getModule().getCourse(), mentor);

        List<Resource> resources = getOrderedResources(lessonId);
        int targetIndex = clampResourceIndex(request.getOrderIndex(), resources.size());

        Resource resource = Resource.builder()
                .lesson(lesson)
                .title(request.getTitle())
                .description(request.getDescription())
                .url(normalizeAndValidateResourceUrl(request.getUrl()))
                .type(normalizeResourceType(request.getType()))
                .orderIndex(targetIndex)
                .build();

        resources.add(targetIndex, resource);
        resequenceResources(resources);

        return mapToResourceResponse(resources.get(targetIndex));
    }

    @Override
    @Transactional
    public ResourceResponse updateResource(Long courseId, Long moduleId, Long lessonId, Long resourceId, ResourceRequest request, User mentor) {
        Resource resource = getResourceAndVerifyOwnership(courseId, moduleId, lessonId, resourceId, mentor);
        validateMentorCanManageCourseContent(resource.getLesson().getModule().getCourse(), mentor);

        List<Resource> resources = getOrderedResources(lessonId);
        resources.removeIf(existing -> existing.getId().equals(resourceId));
        int targetIndex = clampResourceIndex(request.getOrderIndex(), resources.size());

        resource.setTitle(request.getTitle());
        resource.setDescription(request.getDescription());
        resource.setUrl(normalizeAndValidateResourceUrl(request.getUrl()));
        resource.setType(normalizeResourceType(request.getType()));

        resources.add(targetIndex, resource);
        resequenceResources(resources);

        return mapToResourceResponse(resource);
    }

    @Override
    @Transactional
    public void deleteResource(Long courseId, Long moduleId, Long lessonId, Long resourceId, User mentor) {
        Resource resource = getResourceAndVerifyOwnership(courseId, moduleId, lessonId, resourceId, mentor);
        validateMentorCanManageCourseContent(resource.getLesson().getModule().getCourse(), mentor);
        resourceRepository.delete(resource);

        List<Resource> remainingResources = getOrderedResources(lessonId);
        resequenceResources(remainingResources);
    }

    @Override
    @Transactional
    public List<ResourceResponse> reorderResources(Long courseId, Long moduleId, Long lessonId, List<Long> resourceIds, User mentor) {
        Lesson lesson = getLessonAndVerifyOwnership(courseId, moduleId, lessonId, mentor);
        validateMentorCanManageCourseContent(lesson.getModule().getCourse(), mentor);

        List<Resource> resources = getOrderedResources(lessonId);
        if (resourceIds == null || resourceIds.size() != resources.size()) {
            throw new BusinessConflictException("Resource reorder request must include every resource exactly once");
        }

        if (new LinkedHashSet<>(resourceIds).size() != resourceIds.size()) {
            throw new BusinessConflictException("Resource reorder request contains duplicate resource ids");
        }

        Map<Long, Resource> resourceMap = resources.stream()
                .collect(Collectors.toMap(Resource::getId, Function.identity()));

        if (!resourceMap.keySet().equals(new LinkedHashSet<>(resourceIds))) {
            throw new BusinessConflictException("Resource reorder request must match the resources in this lesson");
        }

        List<Resource> reorderedResources = resourceIds.stream()
                .map(resourceMap::get)
                .collect(Collectors.toList());
        resequenceResources(reorderedResources);

        return getResourcesForLesson(courseId, moduleId, lessonId, mentor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceResponse> getResourcesForLesson(Long courseId, Long moduleId, Long lessonId, User user) {
        getLessonAndVerifyOwnership(courseId, moduleId, lessonId, user);
        Lesson lesson = getLessonAndVerifyOwnership(courseId, moduleId, lessonId, user);
        if (!canAccessProtectedCourseContent(lesson.getModule().getCourse(), user)) {
            throw new AccessDeniedException("Enroll in this course to access lesson resources");
        }
        List<Resource> resources = getOrderedResources(lessonId);
        return resources.stream().map(this::mapToResourceResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ResourceResponse getResourceById(Long courseId, Long moduleId, Long lessonId, Long resourceId, User user) {
        Resource resource = getResourceAndVerifyOwnership(courseId, moduleId, lessonId, resourceId, user);
        if (!canAccessProtectedCourseContent(resource.getLesson().getModule().getCourse(), user)) {
            throw new AccessDeniedException("Enroll in this course to access lesson resources");
        }
        return mapToResourceResponse(resource);
    }
}
