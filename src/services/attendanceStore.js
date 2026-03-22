// Firestore-backed attendance store
// Replaces the in-memory store so all devices share the same real-time data

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';

class AttendanceStore {
  // Create a new session in Firestore
  async createSession(sessionData) {
    const sessionRef = doc(db, 'sessions', sessionData.sessionId);
    await setDoc(sessionRef, {
      ...sessionData,
      attendees: [],
      createdAt: serverTimestamp(),
      status: 'active',
    });
    return sessionData;
  }

  // Get session by ID
  async getSession(sessionId) {
    const snap = await getDoc(doc(db, 'sessions', sessionId));
    return snap.exists() ? snap.data() : null;
  }

  // Mark attendance — works from any device
  async markAttendance(sessionId, studentData, sessionMeta = null) {
    const sessionRef = doc(db, 'sessions', sessionId);
    const snap = await getDoc(sessionRef);

    // Auto-create session from QR metadata if it doesn't exist yet
    if (!snap.exists()) {
      if (!sessionMeta) {
        return { success: false, error: 'Session not found' };
      }
      await setDoc(sessionRef, {
        sessionId,
        subject: sessionMeta.subject || 'Unknown',
        section: sessionMeta.section || 'Unknown',
        teacher: sessionMeta.teacher || 'Unknown',
        date: sessionMeta.date || new Date().toISOString().split('T')[0],
        time: sessionMeta.time || '',
        room: sessionMeta.room || 'N/A',
        attendees: [],
        createdAt: serverTimestamp(),
        status: 'active',
      });
    } else {
      // Check for duplicate attendance
      const sessionData = snap.data();
      const already = (sessionData.attendees || []).find(
        (a) => a.studentUID === studentData.studentUID
      );
      if (already) {
        return { success: false, error: 'Attendance already marked for this session' };
      }
    }

    const record = {
      id: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      studentId: studentData.studentId,
      studentName: studentData.studentName,
      studentUID: studentData.studentUID,
      section: studentData.section,
      timestamp: new Date().toISOString(),
      method: 'QR',
      status: 'present',
    };

    // Push record into the attendees array on the session doc
    await updateDoc(sessionRef, {
      attendees: arrayUnion(record),
    });

    // Also write to a sub-collection for easier querying
    await addDoc(collection(db, 'sessions', sessionId, 'attendanceRecords'), record);

    return { success: true, data: record };
  }

  // Real-time listener — fires on every new scan from any device
  subscribe(sessionId, callback) {
    const sessionRef = doc(db, 'sessions', sessionId);
    let knownIds = new Set();
    let initialized = false;

    const unsubscribe = onSnapshot(sessionRef, (snap) => {
      if (!snap.exists()) {
        console.log('[AttendanceStore] Session doc does not exist yet:', sessionId);
        return;
      }

      const data = snap.data();
      const attendees = data.attendees || [];

      console.log('[AttendanceStore] Snapshot received, attendees count:', attendees.length);

      if (!initialized) {
        // First snapshot — seed known IDs so we don't fire for existing records
        attendees.forEach((a) => knownIds.add(a.id));
        initialized = true;
        console.log('[AttendanceStore] Initialized with', knownIds.size, 'existing records');
        return;
      }

      // Fire callback only for genuinely new records
      attendees.forEach((record) => {
        if (!knownIds.has(record.id)) {
          knownIds.add(record.id);
          console.log('[AttendanceStore] New attendance record:', record.studentUID);
          callback(record);
        }
      });
    }, (error) => {
      console.error('[AttendanceStore] onSnapshot error:', error);
    });

    return unsubscribe;
  }

  // Get session stats
  async getSessionStats(sessionId) {
    const snap = await getDoc(doc(db, 'sessions', sessionId));
    if (!snap.exists()) {
      return { totalStudents: 45, present: 0, absent: 45, percentage: 0 };
    }
    const present = (snap.data().attendees || []).length;
    const totalStudents = 35;
    return {
      totalStudents,
      present,
      absent: totalStudents - present,
      percentage: Math.round((present / totalStudents) * 100),
    };
  }

  // Get attendees list
  async getSessionAttendees(sessionId) {
    const snap = await getDoc(doc(db, 'sessions', sessionId));
    return snap.exists() ? snap.data().attendees || [] : [];
  }

  // End session
  async endSession(sessionId) {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, { status: 'completed', endTime: serverTimestamp() });
    const snap = await getDoc(sessionRef);
    return snap.data();
  }
}

const attendanceStore = new AttendanceStore();
export default attendanceStore;
