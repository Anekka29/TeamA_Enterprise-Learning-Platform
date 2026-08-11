import apiClient from '../api/apiClient';

export const CourseContentService = {
    // ------------------------------
    // Course Module Methods
    // ------------------------------
    getModulesForCourse: async (courseId) => {
        const response = await apiClient.get(`/api/courses/${courseId}/modules`);
        return response.data;
    },

    getModuleById: async (courseId, moduleId) => {
        const response = await apiClient.get(`/api/courses/${courseId}/modules/${moduleId}`);
        return response.data;
    },

    createModule: async (courseId, moduleData) => {
        const response = await apiClient.post(`/api/mentor/courses/${courseId}/modules`, moduleData);
        return response.data;
    },

    updateModule: async (courseId, moduleId, moduleData) => {
        const response = await apiClient.put(`/api/mentor/courses/${courseId}/modules/${moduleId}`, moduleData);
        return response.data;
    },

    deleteModule: async (courseId, moduleId) => {
        await apiClient.delete(`/api/mentor/courses/${courseId}/modules/${moduleId}`);
    },

    reorderModules: async (courseId, moduleIds) => {
        const response = await apiClient.put(`/api/mentor/courses/${courseId}/modules/reorder`, moduleIds);
        return response.data;
    },

    // ------------------------------
    // Lesson Methods
    // ------------------------------
    getLessonsForModule: async (courseId, moduleId) => {
        const response = await apiClient.get(`/api/courses/${courseId}/modules/${moduleId}/lessons`);
        return response.data;
    },

    getLessonById: async (courseId, moduleId, lessonId) => {
        const response = await apiClient.get(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
        return response.data;
    },

    createLesson: async (courseId, moduleId, lessonData) => {
        const response = await apiClient.post(`/api/mentor/courses/${courseId}/modules/${moduleId}/lessons`, lessonData);
        return response.data;
    },

    updateLesson: async (courseId, moduleId, lessonId, lessonData) => {
        const response = await apiClient.put(`/api/mentor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, lessonData);
        return response.data;
    },

    deleteLesson: async (courseId, moduleId, lessonId) => {
        await apiClient.delete(`/api/mentor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
    },

    reorderLessons: async (courseId, moduleId, lessonIds) => {
        const response = await apiClient.put(`/api/mentor/courses/${courseId}/modules/${moduleId}/lessons/reorder`, lessonIds);
        return response.data;
    },

    // ------------------------------
    // Resource Methods
    // ------------------------------
    getResourcesForLesson: async (courseId, moduleId, lessonId) => {
        const response = await apiClient.get(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/resources`);
        return response.data;
    },

    getResourceById: async (courseId, moduleId, lessonId, resourceId) => {
        const response = await apiClient.get(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/resources/${resourceId}`);
        return response.data;
    },

    createResource: async (courseId, moduleId, lessonId, resourceData) => {
        const response = await apiClient.post(`/api/mentor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/resources`, resourceData);
        return response.data;
    },

    updateResource: async (courseId, moduleId, lessonId, resourceId, resourceData) => {
        const response = await apiClient.put(`/api/mentor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/resources/${resourceId}`, resourceData);
        return response.data;
    },

    deleteResource: async (courseId, moduleId, lessonId, resourceId) => {
        await apiClient.delete(`/api/mentor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/resources/${resourceId}`);
    },

    reorderResources: async (courseId, moduleId, lessonId, resourceIds) => {
        const response = await apiClient.put(`/api/mentor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/resources/reorder`, resourceIds);
        return response.data;
    }
};

export default CourseContentService;
