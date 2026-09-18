/**
 * Authentication Utility for JWT Token Management
 * Handles token validation, storage, and session management
 */

const AuthUtils = {
  getToken() {
    let token = sessionStorage.getItem('jwt');
    if (!token) {
      token = localStorage.getItem('jwt');
      if (token) {
        sessionStorage.setItem('jwt', token);
      }
    }
    return token;
  },

  isAuthenticated() {
    const token = this.getToken();
    return token !== null && token !== undefined && token !== '';
  },

  clearAuth() {
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('user');
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    let userStr = sessionStorage.getItem('user');
    if (!userStr) {
      userStr = localStorage.getItem('user');
      if (userStr) {
        sessionStorage.setItem('user', userStr);
      }
    }
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

  setAuth(token, user, rememberMe = false) {
    sessionStorage.setItem('jwt', token);
    sessionStorage.setItem('user', JSON.stringify(user));

    if (rememberMe) {
      localStorage.setItem('jwt', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
    }
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
