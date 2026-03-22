// Firestore-backed attendance store
// Uses transactions for atomic duplicate prevention — no race conditions possible

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';

class AttendanceStore {
  async createSession(sessionData) {
    const sessionRef = doc(db, 'sessions', sessionData.sessionId);
    await setDoc(sessionRef, {
      ...sessionData,
      attendees: [],
      attendeeUIDs: [],          // parallel array of UIDs for fast dedup lookup
      createdAt: serverTimestamp(),
      status: 'active',
    });
    return sessionData;
  }

  async getSession(sessionId) {
    const snap = await getDoc(doc(db, 'sessions', sessionId));
    return snap.exists() ? snap.data() : null;
  }

  // Atomic mark attendance — transaction guarantees no duplicates even under concurrent writes
  async markAttendance(sessionId, studentData, sessionMeta = null) {
    const sessionRef = doc(db, 'sessions', sessionId);

    // Dedicated dedup doc — one doc per (session, student), set with merge:false
    // If it already exists the transaction will abort
    const dedupRef = doc(db, 'sessions', sessionId, 'attendanceRecords', `uid_${studentData.studentUID}`);

    const record = {
      id: `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sessionId,
      studentId: studentData.studentId,
      studentName: studentData.studentName,
      studentUID: studentData.studentUID,
      section: studentData.section,
      timestamp: new Date().toISOString(),
      method: studentData.method || 'face',
      status: 'present',
    };

    try {
      await runTransaction(db, async (tx) => {
        const sessionSnap = await tx.get(sessionRef);
        const dedupSnap = await tx.get(dedupRef);

        // ── Hard dedup: dedicated doc already exists ──────────────────────
        if (dedupSnap.exists()) {
          throw new Error('DUPLICATE');
        }

        if (!sessionSnap.exists()) {
          // Auto-create session from QR metadata
          if (!sessionMeta) throw new Error('SESSION_NOT_FOUND');
          tx.set(sessionRef, {
            sessionId,
            subject: sessionMeta.subject || 'Unknown',
            section: sessionMeta.section || 'Unknown',
            teacher: sessionMeta.teacher || 'Unknown',
            date: sessionMeta.date || new Date().toISOString().split('T')[0],
            time: sessionMeta.time || '',
            room: sessionMeta.room || 'N/A',
            attendees: [record],
            attendeeUIDs: [studentData.studentUID],
            createdAt: serverTimestamp(),
            status: 'active',
          });
        } else {
          // ── Soft dedup: check attendeeUIDs array inside transaction ──────
          const data = sessionSnap.data();
          if ((data.attendeeUIDs || []).includes(studentData.studentUID)) {
            throw new Error('DUPLICATE');
          }
          tx.update(sessionRef, {
            attendees: arrayUnion(record),
            attendeeUIDs: arrayUnion(studentData.studentUID),
          });
        }

        // Write dedup sentinel doc — this is the atomic lock
        tx.set(dedupRef, {
          ...record,
          markedAt: serverTimestamp(),
        });
      });

      return { success: true, data: record };
    } catch (err) {
      if (err.message === 'DUPLICATE') {
        return { success: false, error: 'Attendance already marked for this session', duplicate: true };
      }
      if (err.message === 'SESSION_NOT_FOUND') {
        return { success: false, error: 'Session not found' };
      }
      throw err;
    }
  }

  // Real-time listener — fires on every new scan from any device
  subscribe(sessionId, callback) {
    const sessionRef = doc(db, 'sessions', sessionId);
    let knownIds = new Set();
    let initialized = false;

    const unsubscribe = onSnapshot(sessionRef, (snap) => {
      if (!snap.exists()) return;
      const attendees = snap.data().attendees || [];

      if (!initialized) {
        attendees.forEach((a) => knownIds.add(a.id));
        initialized = true;
        return;
      }

      attendees.forEach((record) => {
        if (!knownIds.has(record.id)) {
          knownIds.add(record.id);
          callback(record);
        }
      });
    }, console.error);

    return unsubscribe;
  }

  async getSessionStats(sessionId) {
    const snap = await getDoc(doc(db, 'sessions', sessionId));
    if (!snap.exists()) return { totalStudents: 35, present: 0, absent: 35, percentage: 0 };
    const present = (snap.data().attendees || []).length;
    return {
      totalStudents: 35,
      present,
      absent: 35 - present,
      percentage: Math.round((present / 35) * 100),
    };
  }

  async getSessionAttendees(sessionId) {
    const snap = await getDoc(doc(db, 'sessions', sessionId));
    return snap.exists() ? snap.data().attendees || [] : [];
  }

  async endSession(sessionId) {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, { status: 'completed', endTime: serverTimestamp() });
    const snap = await getDoc(sessionRef);
    return snap.data();
  }
}

const attendanceStore = new AttendanceStore();
export default attendanceStore;
