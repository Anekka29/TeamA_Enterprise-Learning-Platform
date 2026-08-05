package com.skillsphere.service;

import com.skillsphere.dto.CourseModuleRequest;
import com.skillsphere.dto.CourseModuleResponse;
import com.skillsphere.dto.LessonRequest;
import com.skillsphere.dto.LessonResponse;
import com.skillsphere.dto.ResourceRequest;
import com.skillsphere.dto.ResourceResponse;
import com.skillsphere.entity.User;

import java.util.List;

public interface CourseContentService {
    // CourseModule methods
    CourseModuleResponse createModule(Long courseId, CourseModuleRequest request, User mentor);
    CourseModuleResponse updateModule(Long courseId, Long moduleId, CourseModuleRequest request, User mentor);
    void deleteModule(Long courseId, Long moduleId, User mentor);
    List<CourseModuleResponse> reorderModules(Long courseId, List<Long> moduleIds, User mentor);
    List<CourseModuleResponse> getModulesForCourse(Long courseId, User user);
    CourseModuleResponse getModuleById(Long courseId, Long moduleId, User user);

    // Lesson methods
    LessonResponse createLesson(Long courseId, Long moduleId, LessonRequest request, User mentor);
    LessonResponse updateLesson(Long courseId, Long moduleId, Long lessonId, LessonRequest request, User mentor);
    void deleteLesson(Long courseId, Long moduleId, Long lessonId, User mentor);
    List<LessonResponse> reorderLessons(Long courseId, Long moduleId, List<Long> lessonIds, User mentor);
    List<LessonResponse> getLessonsForModule(Long courseId, Long moduleId, User user);
    LessonResponse getLessonById(Long courseId, Long moduleId, Long lessonId, User user);

    // Resource methods
    ResourceResponse createResource(Long courseId, Long moduleId, Long lessonId, ResourceRequest request, User mentor);
    ResourceResponse updateResource(Long courseId, Long moduleId, Long lessonId, Long resourceId, ResourceRequest request, User mentor);
    void deleteResource(Long courseId, Long moduleId, Long lessonId, Long resourceId, User mentor);
    List<ResourceResponse> reorderResources(Long courseId, Long moduleId, Long lessonId, List<Long> resourceIds, User mentor);
    List<ResourceResponse> getResourcesForLesson(Long courseId, Long moduleId, Long lessonId, User user);
    ResourceResponse getResourceById(Long courseId, Long moduleId, Long lessonId, Long resourceId, User user);
}
