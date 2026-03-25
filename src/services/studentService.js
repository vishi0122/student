// Student Service — delegates to dataService (Firestore-backed)
import {
  getStudents,
  getStudentByUID,
  addStudent,
  updateStudent,
  deleteStudent,
} from './dataService';

export const getAllStudents = async () => {
  return getStudents();
};

export const getStudentById = async (studentId) => {
  const all = await getStudents();
  return all.find(s => s.id === studentId) || null;
};

export { getStudentByUID, addStudent, updateStudent, deleteStudent };

export const searchStudents = async (searchQuery) => {
  const all = await getStudents();
  const q = searchQuery.toLowerCase();
  return all.filter(s =>
    s.name?.toLowerCase().includes(q) ||
    s.uid?.toLowerCase().includes(q) ||
    s.section?.toLowerCase().includes(q)
  );
};
