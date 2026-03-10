// In-memory attendance store (simulates real-time database)
// In production, this would be replaced with Firebase Realtime Database

class AttendanceStore {
  constructor() {
    this.sessions = new Map();
    this.attendanceRecords = new Map();
    this.listeners = new Map();
  }

  // Create a new session
  createSession(sessionData) {
    this.sessions.set(sessionData.sessionId, {
      ...sessionData,
      attendees: [],
      createdAt: Date.now()
    });
    return sessionData;
  }

  // Get session by ID
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  // Mark attendance
  markAttendance(sessionId, studentData) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Check if student already marked attendance
    const existingAttendance = session.attendees.find(
      a => a.studentUID === studentData.studentUID
    );

    if (existingAttendance) {
      return {
        success: false,
        error: 'Attendance already marked for this session'
      };
    }

    const attendanceRecord = {
      id: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      studentId: studentData.studentId,
      studentName: studentData.studentName,
      studentUID: studentData.studentUID,
      section: studentData.section,
      timestamp: new Date().toISOString(),
      method: 'QR',
      status: 'present'
    };

    // Add to session attendees
    session.attendees.push(attendanceRecord);

    // Store attendance record
    this.attendanceRecords.set(attendanceRecord.id, attendanceRecord);

    // Notify listeners
    this.notifyListeners(sessionId, attendanceRecord);

    return {
      success: true,
      data: attendanceRecord
    };
  }

  // Get session statistics
  getSessionStats(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        totalStudents: 45,
        present: 0,
        absent: 45,
        percentage: 0
      };
    }

    const present = session.attendees.length;
    const totalStudents = 45; // In production, fetch from database
    const absent = totalStudents - present;
    const percentage = Math.round((present / totalStudents) * 100);

    return {
      totalStudents,
      present,
      absent,
      percentage
    };
  }

  // Get session attendees
  getSessionAttendees(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? session.attendees : [];
  }

  // Subscribe to session updates
  subscribe(sessionId, callback) {
    if (!this.listeners.has(sessionId)) {
      this.listeners.set(sessionId, []);
    }
    this.listeners.get(sessionId).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(sessionId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Notify listeners of new attendance
  notifyListeners(sessionId, attendanceRecord) {
    const listeners = this.listeners.get(sessionId);
    if (listeners) {
      listeners.forEach(callback => callback(attendanceRecord));
    }
  }

  // End session
  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'completed';
      session.endTime = Date.now();
    }
    return session;
  }

  // Clear all data (for testing)
  clear() {
    this.sessions.clear();
    this.attendanceRecords.clear();
    this.listeners.clear();
  }
}

// Create singleton instance
const attendanceStore = new AttendanceStore();

export default attendanceStore;
