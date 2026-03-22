// Run this ONCE to seed all static data into Firestore
// Call seedAll() from browser console or a temp button

import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { db } from './firebase';

const students = [
  { id: 'STU001', uid: '24BCS10001', name: 'Aarav Sharma', section: '601A', year: '2nd Year', email: 'aarav.sharma@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU002', uid: '24BCS10002', name: 'Diya Patel', section: '601A', year: '2nd Year', email: 'diya.patel@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU003', uid: '24BCS10003', name: 'Rohan Gupta', section: '601A', year: '2nd Year', email: 'rohan.gupta@cumail.in', faceRegistered: false, institution: 'college' },
  { id: 'STU004', uid: '24BCS10004', name: 'Ananya Singh', section: '601A', year: '2nd Year', email: 'ananya.singh@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU005', uid: '24BCS10005', name: 'Vikram Verma', section: '601A', year: '2nd Year', email: 'vikram.verma@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU006', uid: '24BCS10006', name: 'Priya Reddy', section: '601A', year: '2nd Year', email: 'priya.reddy@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU007', uid: '24BCS10007', name: 'Arjun Nair', section: '601A', year: '2nd Year', email: 'arjun.nair@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU008', uid: '24BCS10008', name: 'Kavya Iyer', section: '601A', year: '2nd Year', email: 'kavya.iyer@cumail.in', faceRegistered: false, institution: 'college' },
  { id: 'STU009', uid: '24BCS10009', name: 'Siddharth Joshi', section: '601A', year: '2nd Year', email: 'siddharth.joshi@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU010', uid: '24BCS10010', name: 'Meera Kapoor', section: '601A', year: '2nd Year', email: 'meera.kapoor@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU011', uid: '24BCS10011', name: 'Karan Malhotra', section: '601B', year: '2nd Year', email: 'karan.malhotra@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU012', uid: '24BCS10012', name: 'Sneha Desai', section: '601B', year: '2nd Year', email: 'sneha.desai@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU013', uid: '24BCS10013', name: 'Rahul Kumar', section: '601B', year: '2nd Year', email: 'rahul.kumar@cumail.in', faceRegistered: false, institution: 'college' },
  { id: 'STU014', uid: '24BCS10014', name: 'Ishita Sharma', section: '601B', year: '2nd Year', email: 'ishita.sharma@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU015', uid: '24BCS10015', name: 'Aditya Rao', section: '601B', year: '2nd Year', email: 'aditya.rao@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU016', uid: '24BCS10016', name: 'Neha Agarwal', section: '602', year: '2nd Year', email: 'neha.agarwal@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU017', uid: '24BCS10017', name: 'Varun Mehta', section: '602', year: '2nd Year', email: 'varun.mehta@cumail.in', faceRegistered: true, institution: 'college' },
  { id: 'STU018', uid: '24BCS10018', name: 'Pooja Bansal', section: '602', year: '2nd Year', email: 'pooja.bansal@cumail.in', faceRegistered: true, institution: 'college' },
];

const subjects = [
  { id: 'SUB001', code: 'FS', name: 'Full Stack', credits: 4, type: 'Theory', teacher: 'Juned', sections: ['601A', '601B'] },
  { id: 'SUB002', code: 'CC', name: 'Competitive Coding', credits: 2, type: 'Theory', teacher: 'Shivam', sections: ['601A', '601B'] },
  { id: 'SUB003', code: 'SE', name: 'Software Engineering', credits: 4, type: 'Theory', teacher: 'Dr. Siddharth Arora', sections: ['601A', '601B'] },
  { id: 'SUB004', code: 'OS', name: 'Operating Systems', credits: 4, type: 'Theory', teacher: 'Shabnam', sections: ['601A', '601B', '602'] },
  { id: 'SUB005', code: 'DAA', name: 'Design and Analysis of Algorithms', credits: 4, type: 'Theory', teacher: 'Shaqlain', sections: ['601A', '601B'] },
  { id: 'SUB006', code: 'JAVA', name: 'Java', credits: 4, type: 'Theory', teacher: 'Subham K Mishra', sections: ['601A', '601B', '602'] },
  { id: 'SUB007', code: 'SS', name: 'Soft Skills', credits: 2, type: 'Theory', teacher: 'Komal Dhiman', sections: ['601A', '601B', '602'] },
  { id: 'SUB008', code: 'APT', name: 'Aptitude', credits: 2, type: 'Theory', teacher: 'Ashish Agrawal', sections: ['601A', '601B', '602', '603'] },
  { id: 'SUB009', code: 'ML', name: 'Intro to Machine Learning', credits: 3, type: 'Theory', teacher: 'Neeraj', sections: ['601A', '601B'] },
  { id: 'SUB010', code: 'DAA-LAB', name: 'DAA Lab', credits: 2, type: 'Lab', teacher: 'Shaqlain', sections: ['601A', '601B'] },
  { id: 'SUB011', code: 'JAVA-LAB', name: 'Java Lab', credits: 2, type: 'Lab', teacher: 'Subham K Mishra', sections: ['601A', '601B', '602'] },
];

const teachers = [
  { id: 'T001', employeeId: 'CU-FAC-001', name: 'Juned', fullName: 'Prof. Juned Khan', subject: 'Full Stack', email: 'juned@cumail.in', department: 'CSE', institution: 'college' },
  { id: 'T002', employeeId: 'CU-FAC-002', name: 'Shivam', fullName: 'Prof. Shivam Gupta', subject: 'Competitive Coding', email: 'shivam@cumail.in', department: 'CSE', institution: 'college' },
  { id: 'T003', employeeId: 'CU-FAC-003', name: 'Komal Dhiman', fullName: 'Dr. Komal Dhiman', subject: 'Soft Skills', email: 'komal.dhiman@cumail.in', department: 'Humanities', institution: 'college' },
  { id: 'T004', employeeId: 'CU-FAC-004', name: 'Dr. Siddharth Arora', fullName: 'Dr. Siddharth Arora', subject: 'Software Engineering', email: 'siddharth.arora@cumail.in', department: 'CSE', institution: 'college' },
  { id: 'T005', employeeId: 'CU-FAC-005', name: 'Shabnam', fullName: 'Prof. Shabnam Patel', subject: 'Operating Systems', email: 'shabnam@cumail.in', department: 'CSE', institution: 'college' },
  { id: 'T006', employeeId: 'CU-FAC-006', name: 'Shaqlain', fullName: 'Prof. Shaqlain Ahmed', subject: 'DAA', email: 'shaqlain@cumail.in', department: 'CSE', institution: 'college' },
  { id: 'T007', employeeId: 'CU-FAC-007', name: 'Subham K Mishra', fullName: 'Prof. Subham Kumar Mishra', subject: 'Java', email: 'subham.mishra@cumail.in', department: 'CSE', institution: 'college' },
  { id: 'T008', employeeId: 'CU-FAC-008', name: 'Ashish Agrawal', fullName: 'Prof. Ashish Agrawal', subject: 'Aptitude', email: 'ashish.agrawal@cumail.in', department: 'T&P', institution: 'college' },
  { id: 'T009', employeeId: 'CU-FAC-009', name: 'Neeraj', fullName: 'Dr. Neeraj Verma', subject: 'Intro to ML', email: 'neeraj@cumail.in', department: 'CSE', institution: 'college' },
];

const timetableSlots = [
  { id: 'TT001', section: '601A', day: 'Monday', slot: 1, time: '09:30 - 10:20', subject: 'Full Stack', teacher: 'Juned', room: '208', type: 'Lecture' },
  { id: 'TT002', section: '601A', day: 'Monday', slot: 2, time: '10:20 - 11:10', subject: 'Competitive Coding', teacher: 'Shivam', room: '208', type: 'Lecture' },
  { id: 'TT003', section: '601A', day: 'Monday', slot: 3, time: '11:20 - 12:10', subject: 'Software Engineering', teacher: 'Dr. Siddharth Arora', room: '208', type: 'Lecture' },
  { id: 'TT004', section: '601A', day: 'Monday', slot: 6, time: '01:55 - 02:45', subject: 'Soft Skills', teacher: 'Komal Dhiman', room: '208', type: 'Lecture' },
  { id: 'TT005', section: '601A', day: 'Tuesday', slot: 1, time: '09:30 - 10:20', subject: 'DAA Lab', teacher: 'Shaqlain', room: 'Lab 3', type: 'Lab' },
  { id: 'TT006', section: '601A', day: 'Tuesday', slot: 2, time: '10:20 - 11:10', subject: 'Operating Systems', teacher: 'Shabnam', room: '208', type: 'Lecture' },
  { id: 'TT007', section: '601A', day: 'Tuesday', slot: 3, time: '11:20 - 12:10', subject: 'DAA', teacher: 'Shaqlain', room: '208', type: 'Lecture' },
  { id: 'TT008', section: '601A', day: 'Tuesday', slot: 7, time: '02:45 - 03:35', subject: 'Soft Skills', teacher: 'Komal Dhiman', room: '208', type: 'Lecture' },
  { id: 'TT009', section: '601A', day: 'Wednesday', slot: 1, time: '09:30 - 10:20', subject: 'DAA', teacher: 'Shaqlain', room: '208', type: 'Lecture' },
  { id: 'TT010', section: '601A', day: 'Wednesday', slot: 2, time: '10:20 - 11:10', subject: 'Operating Systems', teacher: 'Shabnam', room: '208', type: 'Lecture' },
  { id: 'TT011', section: '601A', day: 'Wednesday', slot: 3, time: '11:20 - 12:10', subject: 'Java', teacher: 'Subham K Mishra', room: '208', type: 'Lecture' },
  { id: 'TT012', section: '601A', day: 'Wednesday', slot: 4, time: '12:10 - 01:00', subject: 'Software Engineering', teacher: 'Dr. Siddharth Arora', room: '208', type: 'Lecture' },
  { id: 'TT013', section: '601A', day: 'Wednesday', slot: 6, time: '01:55 - 02:45', subject: 'Aptitude', teacher: 'Ashish Agrawal', room: '208', type: 'Lecture' },
  { id: 'TT014', section: '601A', day: 'Thursday', slot: 1, time: '09:30 - 10:20', subject: 'Java Lab', teacher: 'Subham K Mishra', room: 'Lab 2', type: 'Lab' },
  { id: 'TT015', section: '601A', day: 'Thursday', slot: 2, time: '10:20 - 11:10', subject: 'Operating Systems', teacher: 'Shabnam', room: '208', type: 'Lecture' },
  { id: 'TT016', section: '601A', day: 'Thursday', slot: 3, time: '11:20 - 12:10', subject: 'DAA', teacher: 'Shaqlain', room: '208', type: 'Lecture' },
  { id: 'TT017', section: '601A', day: 'Thursday', slot: 4, time: '12:10 - 01:00', subject: 'Software Engineering', teacher: 'Dr. Siddharth Arora', room: '208', type: 'Lecture' },
  { id: 'TT018', section: '601A', day: 'Thursday', slot: 6, time: '01:55 - 02:45', subject: 'Aptitude', teacher: 'Ashish Agrawal', room: '208', type: 'Lecture' },
  { id: 'TT019', section: '601A', day: 'Friday', slot: 1, time: '09:30 - 10:20', subject: 'Full Stack', teacher: 'Juned', room: '208', type: 'Lecture' },
  { id: 'TT020', section: '601A', day: 'Friday', slot: 2, time: '10:20 - 11:10', subject: 'Java', teacher: 'Subham K Mishra', room: '208', type: 'Lecture' },
  { id: 'TT021', section: '601A', day: 'Friday', slot: 5, time: '01:05 - 01:55', subject: 'Intro to ML', teacher: 'Neeraj', room: '208', type: 'Lecture' },
];

const users = [
  { id: 'USER-001', employeeId: 'CU-ADM-001', email: 'admin.college@cumail.in', password: 'CU@Admin2024', role: 'admin', instType: 'college', name: 'Dr. Priya Sharma', department: 'CSE Administration', institution: 'Chandigarh University' },
  { id: 'USER-002', employeeId: 'DPS-ADM-001', email: 'admin.school@dps.edu', password: 'School@2024', role: 'admin', instType: 'school', name: 'Dr. Rajesh Kumar', department: 'Administration', institution: 'Delhi Public School' },
  { id: 'USER-003', employeeId: 'CU-FAC-001', email: 'juned@cumail.in', password: 'Juned@FS2024', role: 'faculty', instType: 'college', name: 'Juned', fullName: 'Prof. Juned Khan', department: 'CSE', institution: 'Chandigarh University', subjects: ['Full Stack'], sections: ['601A', '601B'] },
  { id: 'USER-004', employeeId: 'CU-FAC-002', email: 'shivam@cumail.in', password: 'Shivam@CC2024', role: 'faculty', instType: 'college', name: 'Shivam', fullName: 'Prof. Shivam Gupta', department: 'CSE', institution: 'Chandigarh University', subjects: ['Competitive Coding'], sections: ['601A', '601B'] },
  { id: 'USER-005', employeeId: 'CU-FAC-003', email: 'komal.dhiman@cumail.in', password: 'Komal@SS2024', role: 'faculty', instType: 'college', name: 'Komal Dhiman', fullName: 'Dr. Komal Dhiman', department: 'Humanities', institution: 'Chandigarh University', subjects: ['Soft Skills'], sections: ['601A', '601B', '602'] },
  { id: 'USER-006', employeeId: 'CU-FAC-004', email: 'siddharth.arora@cumail.in', password: 'Siddharth@SE2024', role: 'faculty', instType: 'college', name: 'Dr. Siddharth Arora', fullName: 'Dr. Siddharth Arora', department: 'CSE', institution: 'Chandigarh University', subjects: ['Software Engineering'], sections: ['601A', '601B'] },
  { id: 'USER-007', employeeId: 'CU-FAC-005', email: 'shabnam@cumail.in', password: 'Shabnam@OS2024', role: 'faculty', instType: 'college', name: 'Shabnam', fullName: 'Prof. Shabnam Patel', department: 'CSE', institution: 'Chandigarh University', subjects: ['Operating Systems'], sections: ['601A', '601B', '602'] },
  { id: 'USER-008', employeeId: 'CU-FAC-006', email: 'shaqlain@cumail.in', password: 'Shaqlain@DAA2024', role: 'faculty', instType: 'college', name: 'Shaqlain', fullName: 'Prof. Shaqlain Ahmed', department: 'CSE', institution: 'Chandigarh University', subjects: ['Design and Analysis of Algorithms', 'DAA Lab'], sections: ['601A', '601B'] },
  { id: 'USER-009', employeeId: 'CU-FAC-007', email: 'subham.mishra@cumail.in', password: 'Subham@Java2024', role: 'faculty', instType: 'college', name: 'Subham K Mishra', fullName: 'Prof. Subham Kumar Mishra', department: 'CSE', institution: 'Chandigarh University', subjects: ['Java', 'Java Lab'], sections: ['601A', '601B', '602'] },
  { id: 'USER-010', employeeId: 'CU-FAC-008', email: 'ashish.agrawal@cumail.in', password: 'Ashish@APT2024', role: 'faculty', instType: 'college', name: 'Ashish Agrawal', fullName: 'Prof. Ashish Agrawal', department: 'T&P', institution: 'Chandigarh University', subjects: ['Aptitude'], sections: ['601A', '601B', '602', '603'] },
  { id: 'USER-011', employeeId: 'CU-FAC-009', email: 'neeraj@cumail.in', password: 'Neeraj@ML2024', role: 'faculty', instType: 'college', name: 'Neeraj', fullName: 'Dr. Neeraj Verma', department: 'CSE', institution: 'Chandigarh University', subjects: ['Intro to Machine Learning'], sections: ['601A', '601B'] },
  { id: 'USER-012', employeeId: 'DPS-FAC-001', email: 'sharma.math@dps.edu', password: 'Sharma@Math2024', role: 'faculty', instType: 'school', name: 'Mrs. Sharma', fullName: 'Mrs. Anita Sharma', department: 'Science & Mathematics', institution: 'Delhi Public School', subjects: ['Mathematics'], classes: ['Class 10-A'] },
  { id: 'USER-013', employeeId: 'DPS-FAC-002', email: 'patel.science@dps.edu', password: 'Patel@Sci2024', role: 'faculty', instType: 'school', name: 'Mr. Patel', fullName: 'Mr. Ramesh Patel', department: 'Science & Mathematics', institution: 'Delhi Public School', subjects: ['Science'], classes: ['Class 10-A', 'Class 10-B'] },
  { id: 'USER-014', employeeId: 'DPS-FAC-003', email: 'reddy.english@dps.edu', password: 'Reddy@Eng2024', role: 'faculty', instType: 'school', name: 'Ms. Reddy', fullName: 'Ms. Lakshmi Reddy', department: 'Languages', institution: 'Delhi Public School', subjects: ['English'], classes: ['Class 10-A', 'Class 10-B', 'Class 10-C'] },
  { id: 'USER-015', employeeId: 'DPS-FAC-004', email: 'kumar.social@dps.edu', password: 'Kumar@SS2024', role: 'faculty', instType: 'school', name: 'Mr. Kumar', fullName: 'Mr. Vijay Kumar', department: 'Social Sciences', institution: 'Delhi Public School', subjects: ['Social Studies'], classes: ['Class 10-A', 'Class 10-B'] },
  { id: 'USER-016', employeeId: 'DPS-FAC-005', email: 'gupta.hindi@dps.edu', password: 'Gupta@Hindi2024', role: 'faculty', instType: 'school', name: 'Mrs. Gupta', fullName: 'Mrs. Meera Gupta', department: 'Languages', institution: 'Delhi Public School', subjects: ['Hindi'], classes: ['Class 10-A', 'Class 10-B'] },
];

const seedCollection = async (collectionName, items) => {
  const batch = writeBatch(db);
  items.forEach(item => {
    const ref = doc(db, collectionName, item.id);
    batch.set(ref, item);
  });
  await batch.commit();
  console.log(`✅ Seeded ${items.length} docs into '${collectionName}'`);
};

export const seedAll = async () => {
  console.log('🌱 Seeding Firestore...');
  try {
    await seedCollection('students', students);
    await seedCollection('subjects', subjects);
    await seedCollection('teachers', teachers);
    await seedCollection('timetable', timetableSlots);
    await seedCollection('users', users);
    console.log('🎉 All data seeded successfully!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  }
};
