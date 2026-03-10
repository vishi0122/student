// Authentication Service
// This will be replaced with Firebase Authentication in production

import { authenticateUser, getUserByEmail } from '../data/users';

/**
 * Login user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} User data
 */
export const loginUser = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Authenticate user
  const user = authenticateUser(email, password);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Store user in localStorage (in production, use secure token storage)
  localStorage.setItem('attendai_user', JSON.stringify(user));
  
  return user;
};

/**
 * Register new user
 * @param {Object} userData 
 * @returns {Promise<Object>} User data
 */
export const registerUser = async (userData) => {
  // TODO: Implement Firebase user registration
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Register:', userData);
  return userData;
};

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  localStorage.removeItem('attendai_user');
  console.log('User logged out');
};

/**
 * Get current user from localStorage
 * @returns {Object|null} Current user or null
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('attendai_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

/**
 * Reset password
 * @param {string} email 
 * @returns {Promise<Object>}
 */
export const resetPassword = async (email) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = getUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }
  
  // In production, send password reset email via Firebase
  console.log(`Password reset email sent to ${email}`);
  return { success: true, message: 'Password reset email sent' };
};

/**
 * Update user profile
 * @param {string} userId 
 * @param {Object} updates 
 * @returns {Promise<Object>}
 */
export const updateProfile = async (userId, updates) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.id !== userId) {
    throw new Error('Unauthorized');
  }
  
  const updatedUser = { ...currentUser, ...updates };
  localStorage.setItem('attendai_user', JSON.stringify(updatedUser));
  
  return updatedUser;
};
