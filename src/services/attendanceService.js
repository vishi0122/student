// Attendance Service — delegates to attendanceStore (Firestore-backed)
import attendanceStore from './attendanceStore';
import { createAttendanceSession, endSession, generateQRData, validateQRData } from './qrService';
import { getSessions } from './dataService';

export const startAttendanceSession = async (sessionData) => {
  return createAttendanceSession(sessionData);
};

export const markAttendance = async (sessionId, studentId, attendanceData) => {
  return attendanceStore.markAttendance(sessionId, attendanceData);
};

export const endAttendanceSession = async (sessionId) => {
  return endSession(sessionId);
};

export const getAttendanceRecords = async (filters = {}) => {
  return getSessions(filters);
};

export const generateQRCode = async (sessionData) => {
  return generateQRData(sessionData);
};

export const validateQRCode = (qrDataString) => {
  return validateQRData(qrDataString);
};

export const getAttendanceStats = async (filters = {}) => {
  const sessions = await getSessions(filters);
  const totalClasses = sessions.length;
  const totalAttendees = sessions.reduce((sum, s) => sum + (s.attendees?.length || 0), 0);
  const totalExpected = totalClasses * 35;
  return {
    totalClasses,
    averageAttendance: totalExpected > 0 ? Math.round((totalAttendees / totalExpected) * 100) : 0,
    presentCount: totalAttendees,
    absentCount: totalExpected - totalAttendees,
  };
};
