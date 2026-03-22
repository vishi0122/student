// Authentication Service — reads users from Firestore
import { getUserByEmail } from './dataService';

export const loginUser = async (email, password) => {
  const user = await getUserByEmail(email);
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }
  const { password: _, ...safeUser } = user;
  localStorage.setItem('attendai_user', JSON.stringify(safeUser));
  return safeUser;
};

export const logoutUser = async () => {
  localStorage.removeItem('attendai_user');
};

export const getCurrentUser = () => {
  const str = localStorage.getItem('attendai_user');
  if (!str) return null;
  try { return JSON.parse(str); } catch { return null; }
};

export const isAuthenticated = () => getCurrentUser() !== null;

export const updateProfile = async (userId, updates) => {
  const current = getCurrentUser();
  const updated = { ...current, ...updates };
  localStorage.setItem('attendai_user', JSON.stringify(updated));
  return updated;
};
