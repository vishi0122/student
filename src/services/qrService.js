// QR Code Service for Attendance
// Generates dynamic QR codes that refresh periodically to prevent proxy attendance

import attendanceStore from './attendanceStore';

/**
 * Generate a unique QR code data string
 * @param {Object} sessionData - Session information
 * @returns {string} QR code data
 */
export const generateQRData = (sessionData) => {
  const {
    sessionId,
    subject,
    section,
    teacher,
    date,
    time,
    room
  } = sessionData;

  // Generate timestamp-based token (changes every 5 seconds)
  const timestamp = Math.floor(Date.now() / 5000); // 5-second intervals
  
  // Create unique token
  const token = btoa(`${sessionId}-${timestamp}`);
  
  // Create QR data object
  const qrData = {
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
    validUntil: timestamp + 1 // Valid for next 5 seconds
  };

  return JSON.stringify(qrData);
};

/**
 * Validate QR code data
 * @param {string} qrDataString - QR code data string
 * @returns {Object} Validation result
 */
export const validateQRData = (qrDataString) => {
  try {
    const qrData = JSON.parse(qrDataString);
    const currentTimestamp = Math.floor(Date.now() / 5000);
    
    // Check if QR code is still valid
    if (qrData.timestamp > currentTimestamp || qrData.validUntil < currentTimestamp) {
      return {
        valid: false,
        error: 'QR code expired. Please scan the latest code.'
      };
    }
    
    // Check if it's an attendance QR code
    if (qrData.type !== 'attendance') {
      return {
        valid: false,
        error: 'Invalid QR code type'
      };
    }
    
    return {
      valid: true,
      data: qrData
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid QR code format'
    };
  }
};

/**
 * Create a new attendance session
 * @param {Object} sessionInfo - Session information
 * @returns {Object} Session data
 */
export const createAttendanceSession = (sessionInfo) => {
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
    attendees: []
  };

  // Store session
  attendanceStore.createSession(sessionData);

  return sessionData;
};

/**
 * Mark student attendance
 * @param {string} sessionId - Session ID
 * @param {Object} studentData - Student information
 * @returns {Object} Attendance record
 */
export const markAttendance = async (sessionId, studentData, sessionMeta = null) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mark attendance in store, passing full QR data as session meta
  // so student devices can record attendance even without the teacher's session in memory
  const result = attendanceStore.markAttendance(sessionId, studentData, sessionMeta);
  
  if (!result.success) {
    throw new Error(result.error);
  }

  console.log('Attendance marked:', result.data);
  
  return result.data;
};

/**
 * Get session statistics
 * @param {string} sessionId - Session ID
 * @returns {Object} Session statistics
 */
export const getSessionStats = (sessionId) => {
  return attendanceStore.getSessionStats(sessionId);
};

/**
 * Get session attendees
 * @param {string} sessionId - Session ID
 * @returns {Array} List of attendees
 */
export const getSessionAttendees = (sessionId) => {
  return attendanceStore.getSessionAttendees(sessionId);
};

/**
 * Subscribe to session updates
 * @param {string} sessionId - Session ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToSession = (sessionId, callback) => {
  return attendanceStore.subscribe(sessionId, callback);
};

/**
 * End attendance session
 * @param {string} sessionId - Session ID
 * @returns {Object} Final session data
 */
export const endSession = async (sessionId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const session = attendanceStore.endSession(sessionId);
  console.log('Session ended:', sessionId);
  
  return session;
};
