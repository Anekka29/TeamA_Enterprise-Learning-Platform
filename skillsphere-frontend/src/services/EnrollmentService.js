import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const STUDENT_ENROLLMENT_UPDATED_EVENT = 'skillsphere:student-enrollment-updated';

function notifyEnrollmentUpdated(courseId) {
    window.dispatchEvent(new CustomEvent(STUDENT_ENROLLMENT_UPDATED_EVENT, {
        detail: { courseId },
    }));
}

export const EnrollmentService = {
    enrollInCourse: async (courseId, options = {}) => {
        const response = await apiClient.post(API_ENDPOINTS.ENROLLMENTS, { courseId });
        if (!options.silent) {
            notifyEnrollmentUpdated(courseId);
        }
        return response.data;
    },

    getMyEnrollments: async () => {
        const response = await apiClient.get(API_ENDPOINTS.MY_ENROLLMENTS);
        return response.data;
    },

    getCourseEnrollments: async (courseId) => {
        const response = await apiClient.get(`/api/mentor/courses/${courseId}/enrollments`);
        return response.data;
    },

    updateEnrollmentProgress: async (enrollmentId, progress, lessonsCompleted) => {
        const params = new URLSearchParams();
        if (progress !== undefined && progress !== null) {
            params.set('progress', progress);
        }
        if (lessonsCompleted !== undefined && lessonsCompleted !== null) {
            params.set('lessonsCompleted', lessonsCompleted);
        }
        const response = await apiClient.put(`/api/student/enrollments/${enrollmentId}/progress?${params.toString()}`);
        return response.data;
    },

    markLessonComplete: async (lessonId) => {
        const response = await apiClient.post(`/api/student/lessons/${lessonId}/complete`);
        return response.data;
    },

    markLessonIncomplete: async (lessonId) => {
        const response = await apiClient.delete(`/api/student/lessons/${lessonId}/complete`);
        return response.data;
    },

    getCompletedLessonIds: async (courseId) => {
        const response = await apiClient.get(`/api/student/courses/${courseId}/completed-lessons`);
        return response.data;
    },

    saveNotes: async (enrollmentId, notes) => {
        const response = await apiClient.post(`/api/student/enrollments/${enrollmentId}/notes`, { notes });
        return response.data;
    },

    saveBookmarks: async (enrollmentId, bookmarks) => {
        const response = await apiClient.post(`/api/student/enrollments/${enrollmentId}/bookmarks`, { bookmarks });
        return response.data;
    },

    updateLastOpenedLesson: async (enrollmentId, lessonId) => {
        const response = await apiClient.put(`/api/student/enrollments/${enrollmentId}/last-opened/${lessonId}`);
        return response.data;
    }
};

export default EnrollmentService;
