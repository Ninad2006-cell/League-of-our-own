import { api } from './api';

export const authService = {
  // Check if user is authenticated
  isAuthenticated() {
    return api.isAuthenticated();
  },

  // Get current user from storage
  getCurrentUser() {
    return api.getCurrentUserFromStorage();
  },

  // Get JWT token
  getToken() {
    return localStorage.getItem('cdms_auth_token');
  },

  // Login user
  async login(email, password) {
    return await api.login(email, password);
  },

  // Register user
  async register(name, email, password, role = 'user') {
    return await api.register(name, email, password, role);
  },

  // Logout user
  logout() {
    api.logout();
    // Redirect to login page
    window.location.href = '/login';
  },

  // Get user role
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },

  // Check if user has specific role
  hasRole(role) {
    const userRole = this.getUserRole();
    return userRole === role;
  },

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  },

  // Check if user is scorer
  isScorer() {
    return this.hasRole('scorer');
  },

  // Check if user is regular user
  isUser() {
    return this.hasRole('user');
  },
};

export default authService;
