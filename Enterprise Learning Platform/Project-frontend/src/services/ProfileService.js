import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../constants/api';

const ProfileService = {
  /**
   * Get current authenticated user's profile
   */
  getCurrentProfile() {
    return apiClient.get(API_ENDPOINTS.PROFILE_ME);
  },

  /**
   * Update student profile
   */
  updateStudentProfile(profileData) {
    return apiClient.put(API_ENDPOINTS.PROFILE_STUDENT, profileData);
  },

  /**
   * Update mentor profile
   */
  updateMentorProfile(profileData) {
    return apiClient.put(API_ENDPOINTS.PROFILE_MENTOR, profileData);
  },

  /**
   * Update admin profile
   */
  updateAdminProfile(profileData) {
    return apiClient.put(API_ENDPOINTS.PROFILE_ADMIN, profileData);
  },
};

export default ProfileService;
