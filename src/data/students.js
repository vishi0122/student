// Chandigarh University - CSE 2nd Year Students
// Section: 24BCS_KRG_601A

export const STUDENTS_601A = [
  { id: 'STU001', uid: '24BCS10001', name: 'Aarav Sharma', section: '601A', year: '2nd Year', email: 'aarav.sharma@cumail.in', faceRegistered: true },
  { id: 'STU002', uid: '24BCS10002', name: 'Diya Patel', section: '601A', year: '2nd Year', email: 'diya.patel@cumail.in', faceRegistered: true },
  { id: 'STU003', uid: '24BCS10003', name: 'Rohan Gupta', section: '601A', year: '2nd Year', email: 'rohan.gupta@cumail.in', faceRegistered: false },
  { id: 'STU004', uid: '24BCS10004', name: 'Ananya Singh', section: '601A', year: '2nd Year', email: 'ananya.singh@cumail.in', faceRegistered: true },
  { id: 'STU005', uid: '24BCS10005', name: 'Vikram Verma', section: '601A', year: '2nd Year', email: 'vikram.verma@cumail.in', faceRegistered: true },
  { id: 'STU006', uid: '24BCS10006', name: 'Priya Reddy', section: '601A', year: '2nd Year', email: 'priya.reddy@cumail.in', faceRegistered: true },
  { id: 'STU007', uid: '24BCS10007', name: 'Arjun Nair', section: '601A', year: '2nd Year', email: 'arjun.nair@cumail.in', faceRegistered: true },
  { id: 'STU008', uid: '24BCS10008', name: 'Kavya Iyer', section: '601A', year: '2nd Year', email: 'kavya.iyer@cumail.in', faceRegistered: false },
  { id: 'STU009', uid: '24BCS10009', name: 'Siddharth Joshi', section: '601A', year: '2nd Year', email: 'siddharth.joshi@cumail.in', faceRegistered: true },
  { id: 'STU010', uid: '24BCS10010', name: 'Meera Kapoor', section: '601A', year: '2nd Year', email: 'meera.kapoor@cumail.in', faceRegistered: true },
];

export const STUDENTS_601B = [
  { id: 'STU011', uid: '24BCS10011', name: 'Karan Malhotra', section: '601B', year: '2nd Year', email: 'karan.malhotra@cumail.in', faceRegistered: true },
  { id: 'STU012', uid: '24BCS10012', name: 'Sneha Desai', section: '601B', year: '2nd Year', email: 'sneha.desai@cumail.in', faceRegistered: true },
  { id: 'STU013', uid: '24BCS10013', name: 'Rahul Kumar', section: '601B', year: '2nd Year', email: 'rahul.kumar@cumail.in', faceRegistered: false },
  { id: 'STU014', uid: '24BCS10014', name: 'Ishita Sharma', section: '601B', year: '2nd Year', email: 'ishita.sharma@cumail.in', faceRegistered: true },
  { id: 'STU015', uid: '24BCS10015', name: 'Aditya Rao', section: '601B', year: '2nd Year', email: 'aditya.rao@cumail.in', faceRegistered: true },
];

export const STUDENTS_602 = [
  { id: 'STU016', uid: '24BCS10016', name: 'Neha Agarwal', section: '602', year: '2nd Year', email: 'neha.agarwal@cumail.in', faceRegistered: true },
  { id: 'STU017', uid: '24BCS10017', name: 'Varun Mehta', section: '602', year: '2nd Year', email: 'varun.mehta@cumail.in', faceRegistered: true },
  { id: 'STU018', uid: '24BCS10018', name: 'Pooja Bansal', section: '602', year: '2nd Year', email: 'pooja.bansal@cumail.in', faceRegistered: true },
];

// Get all students
export const ALL_STUDENTS = [
  ...STUDENTS_601A,
  ...STUDENTS_601B,
  ...STUDENTS_602,
];

// Helper functions
export const getStudentsBySection = (section) => {
  return ALL_STUDENTS.filter(s => s.section === section);
};

export const getStudentByUID = (uid) => {
  return ALL_STUDENTS.find(s => s.uid === uid);
};

export const getStudentById = (id) => {
  return ALL_STUDENTS.find(s => s.id === id);
};

export const getStudentsWithoutFaceRegistration = () => {
  return ALL_STUDENTS.filter(s => !s.faceRegistered);
};
