// Central Firestore data service — replaces all src/data/*.js static imports
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, getCountFromServer
} from 'firebase/firestore';
import { db } from './firebase';

// ─── STUDENTS ────────────────────────────────────────────────────────────────

export const getStudents = async (filters = {}) => {
  let q = collection(db, 'students');
  const constraints = [];
  if (filters.section) constraints.push(where('section', '==', filters.section));
  if (filters.institution) constraints.push(where('institution', '==', filters.institution));
  if (constraints.length) q = query(q, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
};

export const getStudentByUID = async (uid) => {
  const q = query(collection(db, 'students'), where('uid', '==', uid));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data();
};

export const addStudent = async (data) => {
  const ref = await addDoc(collection(db, 'students'), data);
  return { id: ref.id, ...data };
};

export const updateStudent = async (id, updates) => {
  await updateDoc(doc(db, 'students', id), updates);
};

export const deleteStudent = async (id) => {
  await deleteDoc(doc(db, 'students', id));
};

export const getStudentCount = async () => {
  const snap = await getCountFromServer(collection(db, 'students'));
  return snap.data().count;
};

// ─── SUBJECTS ────────────────────────────────────────────────────────────────

export const getSubjects = async (filters = {}) => {
  let q = collection(db, 'subjects');
  const constraints = [];
  if (filters.teacher) constraints.push(where('teacher', '==', filters.teacher));
  if (filters.type) constraints.push(where('type', '==', filters.type));
  if (constraints.length) q = query(q, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
};

export const getSubjectsByTeacher = async (teacherName) => {
  return getSubjects({ teacher: teacherName });
};

// ─── TEACHERS ────────────────────────────────────────────────────────────────

export const getTeachers = async () => {
  const snap = await getDocs(collection(db, 'teachers'));
  return snap.docs.map(d => d.data());
};

// ─── TIMETABLE ───────────────────────────────────────────────────────────────

export const getTimetableByDay = async (section, day) => {
  const q = query(
    collection(db, 'timetable'),
    where('section', '==', section),
    where('day', '==', day),
    orderBy('slot')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
};

export const getTimetableByTeacher = async (teacherName) => {
  const q = query(collection(db, 'timetable'), where('teacher', '==', teacherName));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
};

export const getCurrentLectureFromDB = async (section, day, currentTimeMinutes) => {
  const slots = await getTimetableByDay(section, day);
  return slots.find(slot => {
    const [startH, startM] = slot.time.split(' - ')[0].trim().split(':').map(Number);
    const [endH, endM] = slot.time.split(' - ')[1].trim().split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    return currentTimeMinutes >= start && currentTimeMinutes < end;
  }) || null;
};

// ─── USERS ───────────────────────────────────────────────────────────────────

export const getUserByEmail = async (email) => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data();
};

// ─── SESSIONS ────────────────────────────────────────────────────────────────

export const getSessions = async (filters = {}) => {
  let q = collection(db, 'sessions');
  const constraints = [];
  if (filters.teacher) constraints.push(where('teacher', '==', filters.teacher));
  if (filters.section) constraints.push(where('section', '==', filters.section));
  if (filters.date) constraints.push(where('date', '==', filters.date));
  if (constraints.length) q = query(q, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getSessionCount = async () => {
  const snap = await getCountFromServer(collection(db, 'sessions'));
  return snap.data().count;
};

// Real-time listener for dashboard stats
export const subscribeToStats = (callback) => {
  return onSnapshot(collection(db, 'sessions'), (snap) => {
    const sessions = snap.docs.map(d => d.data());
    const totalAttendees = sessions.reduce((sum, s) => sum + (s.attendees?.length || 0), 0);
    const totalExpected = sessions.length * 35;
    const avgAttendance = totalExpected > 0
      ? Math.round((totalAttendees / totalExpected) * 100)
      : 0;
    callback({
      totalSessions: sessions.length,
      avgAttendance,
      activeSessions: sessions.filter(s => s.status === 'active').length,
    });
  });
};
