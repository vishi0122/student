// QR Code Service for Attendance
// Uses Firestore for real-time cross-device sync

import attendanceStore from './attendanceStore';

// Generate a dynamic QR code string (refreshes every 5 seconds)
export const generateQRData = (sessionData) => {
  const { sessionId, subject, section, teacher, date, time, room } = sessionData;
  const timestamp = Math.floor(Date.now() / 5000);
  const token = btoa(`${sessionId}-${timestamp}`);

  return JSON.stringify({
    type: 'attendance',
    sessionId,
    subject,
    section,
    teacher,
    date,
    time,
    room,
    token,
    timestamp,
    validUntil: timestamp + 1,
  });
};

// Validate scanned QR code
export const validateQRData = (qrDataString) => {
  try {
    const qrData = JSON.parse(qrDataString);
    const currentTimestamp = Math.floor(Date.now() / 5000);

    if (qrData.timestamp > currentTimestamp || qrData.validUntil < currentTimestamp) {
      return { valid: false, error: 'QR code expired. Please scan the latest code.' };
    }
    if (qrData.type !== 'attendance') {
      return { valid: false, error: 'Invalid QR code type' };
    }
    return { valid: true, data: qrData };
  } catch {
    return { valid: false, error: 'Invalid QR code format' };
  }
};

// Create a new attendance session in Firestore
export const createAttendanceSession = async (sessionInfo) => {
  const sessionId = `SESSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const sessionData = {
    sessionId,
    subject: sessionInfo.subject,
    section: sessionInfo.section,
    teacher: sessionInfo.teacher,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    room: sessionInfo.room || 'N/A',
    startTime: Date.now(),
    status: 'active',
    attendees: [],
  };

  await attendanceStore.createSession(sessionData);
  return sessionData;
};

// Mark student attendance (works cross-device via Firestore)
export const markAttendance = async (sessionId, studentData, sessionMeta = null) => {
  const result = await attendanceStore.markAttendance(sessionId, studentData, sessionMeta);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
};

// Real-time subscription — fires callback whenever any device marks attendance
export const subscribeToSession = (sessionId, callback) => {
  return attendanceStore.subscribe(sessionId, callback);
};

export const getSessionStats = (sessionId) => attendanceStore.getSessionStats(sessionId);
export const getSessionAttendees = (sessionId) => attendanceStore.getSessionAttendees(sessionId);

export const endSession = async (sessionId) => {
  return attendanceStore.endSession(sessionId);
};
