/**
 * Authentication Utility for JWT Token Management
 * Handles token validation, storage, and session management
 */

const AuthUtils = {
  getToken() {
    return localStorage.getItem('jwt');
  },

  isAuthenticated() {
    const token = this.getToken();
    return token !== null && token !== undefined && token !== '';
  },

  clearAuth() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  },

  setAuth(token, user) {
    localStorage.setItem('jwt', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  setupTokenValidation(callback) {
    const intervalId = setInterval(() => {
      if (!this.isAuthenticated()) {
        clearInterval(intervalId);
        if (callback) callback();
      }
    }, 60000);
    return intervalId;
  },
};

export default AuthUtils;
