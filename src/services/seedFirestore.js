// One-time seed: creates Firebase Auth accounts + writes all Firestore data
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

const auth = getAuth();

const userProfiles = [
  { email: 'admin.college@cumail.in', password: 'CU@Admin2024', role: 'admin', instType: 'college', name: 'Dr. Priya Sharma', department: 'CSE Administration', institution: 'Chandigarh University', employeeId: 'CU-ADM-001' },
  { email: 'admin.school@dps.edu', password: 'School@2024', role: 'admin', instType: 'school', name: 'Dr. Rajesh Kumar', department: 'Administration', institution: 'Delhi Public School', employeeId: 'DPS-ADM-001' },
  { email: 'juned@cumail.in', password: 'Juned@FS2024', role: 'faculty', instType: 'college', name: 'Juned', fullName: 'Prof. Juned Khan', department: 'CSE', institution: 'Chandigarh University', subjects: ['Full Stack'], sections: ['601A', '601B'], employeeId: 'CU-FAC-001' },
  { email: 'shivam@cumail.in', password: 'Shivam@CC2024', role: 'faculty', instType: 'college', name: 'Shivam', fullName: 'Prof. Shivam Gupta', department: 'CSE', institution: 'Chandigarh University', subjects: ['Competitive Coding'], sections: ['601A', '601B'], employeeId: 'CU-FAC-002' },
  { email: 'komal.dhiman@cumail.in', password: 'Komal@SS2024', role: 'faculty', instType: 'college', name: 'Komal Dhiman', fullName: 'Dr. Komal Dhiman', department: 'Humanities', institution: 'Chandigarh University', subjects: ['Soft Skills'], sections: ['601A', '601B', '602'], employeeId: 'CU-FAC-003' },
  { email: 'siddharth.arora@cumail.in', password: 'Siddharth@SE2024', role: 'faculty', instType: 'college', name: 'Dr. Siddharth Arora', fullName: 'Dr. Siddharth Arora', department: 'CSE', institution: 'Chandigarh University', subjects: ['Software Engineering'], sections: ['601A', '601B'], employeeId: 'CU-FAC-004' },
  { email: 'shabnam@cumail.in', password: 'Shabnam@OS2024', role: 'faculty', instType: 'college', name: 'Shabnam', fullName: 'Prof. Shabnam Patel', department: 'CSE', institution: 'Chandigarh University', subjects: ['Operating Systems'], sections: ['601A', '601B', '602'], employeeId: 'CU-FAC-005' },
  { email: 'shaqlain@cumail.in', password: 'Shaqlain@DAA2024', role: 'faculty', instType: 'college', name: 'Shaqlain', fullName: 'Prof. Shaqlain Ahmed', department: 'CSE', institution: 'Chandigarh University', subjects: ['Design and Analysis of Algorithms', 'DAA Lab'], sections: ['601A', '601B'], employeeId: 'CU-FAC-006' },
  { email: 'subham.mishra@cumail.in', password: 'Subham@Java2024', role: 'faculty', instType: 'college', name: 'Subham K Mishra', fullName: 'Prof. Subham Kumar Mishra', department: 'CSE', institution: 'Chandigarh University', subjects: ['Java', 'Java Lab'], sections: ['601A', '601B', '602'], employeeId: 'CU-FAC-007' },
  { email: 'ashish.agrawal@cumail.in', password: 'Ashish@APT2024', role: 'faculty', instType: 'college', name: 'Ashish Agrawal', fullName: 'Prof. Ashish Agrawal', department: 'T&P', institution: 'Chandigarh University', subjects: ['Aptitude'], sections: ['601A', '601B', '602', '603'], employeeId: 'CU-FAC-008' },
  { email: 'neeraj@cumail.in', password: 'Neeraj@ML2024', role: 'faculty', instType: 'college', name: 'Neeraj', fullName: 'Dr. Neeraj Verma', department: 'CSE', institution: 'Chandigarh University', subjects: ['Intro to Machine Learning'], sections: ['601A', '601B'], employeeId: 'CU-FAC-009' },
  { email: 'sharma.math@dps.edu', password: 'Sharma@Math2024', role: 'faculty', instType: 'school', name: 'Mrs. Sharma', fullName: 'Mrs. Anita Sharma', department: 'Science & Mathematics', institution: 'Delhi Public School', subjects: ['Mathematics'], classes: ['Class 10-A'], employeeId: 'DPS-FAC-001' },
  { email: 'patel.science@dps.edu', password: 'Patel@Sci2024', role: 'faculty', instType: 'school', name: 'Mr. Patel', fullName: 'Mr. Ramesh Patel', department: 'Science & Mathematics', institution: 'Delhi Public School', subjects: ['Science'], classes: ['Class 10-A', 'Class 10-B'], employeeId: 'DPS-FAC-002' },
  { email: 'reddy.english@dps.edu', password: 'Reddy@Eng2024', role: 'faculty', instType: 'school', name: 'Ms. Reddy', fullName: 'Ms. Lakshmi Reddy', department: 'Languages', institution: 'Delhi Public School', subjects: ['English'], classes: ['Class 10-A', 'Class 10-B', 'Class 10-C'], employeeId: 'DPS-FAC-003' },
  { email: 'kumar.social@dps.edu', password: 'Kumar@SS2024', role: 'faculty', instType: 'school', name: 'Mr. Kumar', fullName: 'Mr. Vijay Kumar', department: 'Social Sciences', institution: 'Delhi Public School', subjects: ['Social Studies'], classes: ['Class 10-A', 'Class 10-B'], employeeId: 'DPS-FAC-004' },
  { email: 'gupta.hindi@dps.edu', password: 'Gupta@Hindi2024', role: 'faculty', instType: 'school', name: 'Mrs. Gupta', fullName: 'Mrs. Meera Gupta', department: 'Languages', institution: 'Delhi Public School', subjects: ['Hindi'], classes: ['Class 10-A', 'Class 10-B'], employeeId: 'DPS-FAC-005' },
];

const students = [
  // ── Section 605A (real data) ──────────────────────────────────────────────
  { id: 'STU605A001', uid: '24BCS10047', name: 'Rohit Raj',            section: '605A', year: '2nd Year', email: '24bcs10047@cumail.in', parentEmail: 'parent.rohitraj@gmail.com',         faceRegistered: false, institution: 'college' },
  { id: 'STU605A002', uid: '24BCS10057', name: 'Himanshu Kumar',       section: '605A', year: '2nd Year', email: '24bcs10057@cumail.in', parentEmail: 'parent.himanshu@gmail.com',          faceRegistered: false, institution: 'college' },
  { id: 'STU605A003', uid: '24BCS10096', name: 'Diya Sharma',          section: '605A', year: '2nd Year', email: '24bcs10096@cumail.in', parentEmail: 'parent.diyasharma@gmail.com',        faceRegistered: false, institution: 'college' },
  { id: 'STU605A004', uid: '24BCS10244', name: 'Aashu Babu',           section: '605A', year: '2nd Year', email: '24bcs10244@cumail.in', parentEmail: 'parent.aashubabu@gmail.com',         faceRegistered: false, institution: 'college' },
  { id: 'STU605A005', uid: '24BCS10247', name: 'Karan Kumar',          section: '605A', year: '2nd Year', email: '24bcs10247@cumail.in', parentEmail: 'parent.karankumar@gmail.com',        faceRegistered: false, institution: 'college' },
  { id: 'STU605A006', uid: '24BCS10351', name: 'Prakhar Sisodiya',     section: '605A', year: '2nd Year', email: '24bcs10351@cumail.in', parentEmail: 'parent.prakhar@gmail.com',           faceRegistered: false, institution: 'college' },
  { id: 'STU605A007', uid: '24BCS10460', name: 'Harshpreet Kaur',      section: '605A', year: '2nd Year', email: '24bcs10460@cumail.in', parentEmail: 'parent.harshpreet@gmail.com',        faceRegistered: false, institution: 'college' },
  { id: 'STU605A008', uid: '24BCS10476', name: 'Sahilpreet Singh',     section: '605A', year: '2nd Year', email: '24bcs10476@cumail.in', parentEmail: 'parent.sahilpreet@gmail.com',        faceRegistered: false, institution: 'college' },
  { id: 'STU605A009', uid: '24BCS10558', name: 'Naveen',               section: '605A', year: '2nd Year', email: '24bcs10558@cumail.in', parentEmail: 'parent.naveen@gmail.com',            faceRegistered: false, institution: 'college' },
  { id: 'STU605A010', uid: '24BCS10567', name: 'Shreya Kumari',        section: '605A', year: '2nd Year', email: '24bcs10567@cumail.in', parentEmail: 'parent.shreyakumari@gmail.com',      faceRegistered: false, institution: 'college' },
  { id: 'STU605A011', uid: '24BCS10614', name: 'Bhumika',              section: '605A', year: '2nd Year', email: '24bcs10614@cumail.in', parentEmail: 'parent.bhumika@gmail.com',           faceRegistered: false, institution: 'college' },
  { id: 'STU605A012', uid: '24BCS10668', name: 'Vishal Kumar',         section: '605A', year: '2nd Year', email: '24bcs10668@cumail.in', parentEmail: 'parent.vishalkumar@gmail.com',       faceRegistered: false, institution: 'college' },
  { id: 'STU605A013', uid: '24BCS10692', name: 'Shagun Jangra',        section: '605A', year: '2nd Year', email: '24bcs10692@cumail.in', parentEmail: 'parent.shagun@gmail.com',            faceRegistered: false, institution: 'college' },
  { id: 'STU605A014', uid: '24BCS10841', name: 'Dutimaya Pradhan',     section: '605A', year: '2nd Year', email: '24bcs10841@cumail.in', parentEmail: 'parent.dutimaya@gmail.com',          faceRegistered: false, institution: 'college' },
  { id: 'STU605A015', uid: '24BCS10938', name: 'Shchi Sharda',         section: '605A', year: '2nd Year', email: '24bcs10938@cumail.in', parentEmail: 'parent.shchi@gmail.com',             faceRegistered: false, institution: 'college' },
  { id: 'STU605A016', uid: '24BCS10976', name: 'Rishav Kumar',         section: '605A', year: '2nd Year', email: '24bcs10976@cumail.in', parentEmail: 'parent.rishav@gmail.com',            faceRegistered: false, institution: 'college' },
  { id: 'STU605A017', uid: '24BCS10977', name: 'Shivam Bind',          section: '605A', year: '2nd Year', email: '24bcs10977@cumail.in', parentEmail: 'parent.shivambind@gmail.com',        faceRegistered: false, institution: 'college' },
  { id: 'STU605A018', uid: '24BCS11023', name: 'Priyanshu Bindal',     section: '605A', year: '2nd Year', email: '24bcs11023@cumail.in', parentEmail: 'parent.priyanshu@gmail.com',         faceRegistered: false, institution: 'college' },
  { id: 'STU605A019', uid: '24BCS11042', name: 'Shreya',               section: '605A', year: '2nd Year', email: '24bcs11042@cumail.in', parentEmail: 'parent.shreya@gmail.com',            faceRegistered: false, institution: 'college' },
  { id: 'STU605A020', uid: '24BCS11164', name: 'Garima Sharma',        section: '605A', year: '2nd Year', email: '24bcs11164@cumail.in', parentEmail: 'parent.garima@gmail.com',            faceRegistered: false, institution: 'college' },
  { id: 'STU605A021', uid: '24BCS11288', name: 'Samar Kumar',          section: '605A', year: '2nd Year', email: '24bcs11288@cumail.in', parentEmail: 'parent.samar@gmail.com',             faceRegistered: false, institution: 'college' },
  { id: 'STU605A022', uid: '24BCS11317', name: 'Lucky',                section: '605A', year: '2nd Year', email: '24bcs11317@cumail.in', parentEmail: 'parent.lucky@gmail.com',             faceRegistered: false, institution: 'college' },
  { id: 'STU605A023', uid: '24BCS11462', name: 'Muskaan Rajora',       section: '605A', year: '2nd Year', email: '24bcs11462@cumail.in', parentEmail: 'parent.muskaan@gmail.com',           faceRegistered: false, institution: 'college' },
  { id: 'STU605A024', uid: '24BCS11651', name: 'Ankit Kumar',          section: '605A', year: '2nd Year', email: '24bcs11651@cumail.in', parentEmail: 'parent.ankit@gmail.com',             faceRegistered: false, institution: 'college' },
  { id: 'STU605A025', uid: '24BCS11679', name: 'Saatvik Sawarn',       section: '605A', year: '2nd Year', email: '24bcs11679@cumail.in', parentEmail: 'parent.saatvik@gmail.com',           faceRegistered: false, institution: 'college' },
  { id: 'STU605A026', uid: '24BCS11844', name: 'Paras',                section: '605A', year: '2nd Year', email: '24bcs11844@cumail.in', parentEmail: 'parent.paras@gmail.com',             faceRegistered: false, institution: 'college' },
  { id: 'STU605A027', uid: '24BCS11875', name: 'Shivam Jaiswal',       section: '605A', year: '2nd Year', email: '24bcs11875@cumail.in', parentEmail: 'parent.shivamjaiswal@gmail.com',     faceRegistered: false, institution: 'college' },
  { id: 'STU605A028', uid: '24BCS11888', name: 'Yash Kumar Sisodia',   section: '605A', year: '2nd Year', email: '24bcs11888@cumail.in', parentEmail: 'parent.yash@gmail.com',              faceRegistered: false, institution: 'college' },
  { id: 'STU605A029', uid: '24BCS11918', name: 'Akshata Singh',        section: '605A', year: '2nd Year', email: '24bcs11918@cumail.in', parentEmail: 'parent.akshata@gmail.com',           faceRegistered: false, institution: 'college' },
  { id: 'STU605A030', uid: '24BCS12062', name: 'Love Bhardwaj',        section: '605A', year: '2nd Year', email: '24bcs12062@cumail.in', parentEmail: 'parent.love@gmail.com',              faceRegistered: false, institution: 'college' },
  { id: 'STU605A031', uid: '24BCS12269', name: 'Divyanshu Kumar',      section: '605A', year: '2nd Year', email: '24bcs12269@cumail.in', parentEmail: 'parent.divyanshu@gmail.com',         faceRegistered: false, institution: 'college' },
  { id: 'STU605A032', uid: '24BCS12503', name: 'Aditya Raj',           section: '605A', year: '2nd Year', email: '24bcs12503@cumail.in', parentEmail: 'parent.adityaraj@gmail.com',         faceRegistered: false, institution: 'college' },
  { id: 'STU605A033', uid: '24BCS12794', name: 'Aarav Sharma',         section: '605A', year: '2nd Year', email: '24bcs12794@cumail.in', parentEmail: 'parent.aarav@gmail.com',             faceRegistered: false, institution: 'college' },
  { id: 'STU605A034', uid: '24BCS12868', name: 'Rudra Pratap Singh',   section: '605A', year: '2nd Year', email: '24bcs12868@cumail.in', parentEmail: 'parent.rudra@gmail.com',             faceRegistered: false, institution: 'college' },
  { id: 'STU605A035', uid: '24BCS12978', name: 'Kumari Riya',          section: '605A', year: '2nd Year', email: '24bcs12978@cumail.in', parentEmail: 'parent.riya@gmail.com',              faceRegistered: false, institution: 'college' },
];

const subjects = [
  // ── College 605A subjects ─────────────────────────────────────────────────
  { id: 'SUB001', code: 'FS', name: 'Full Stack', credits: 4, type: 'Theory', teacher: 'Juned', sections: ['605A'], institution: 'college' },
  { id: 'SUB002', code: 'CC', name: 'Competitive Coding', credits: 2, type: 'Theory', teacher: 'Shivam', sections: ['605A'], institution: 'college' },
  { id: 'SUB003', code: 'SE', name: 'Software Engineering', credits: 4, type: 'Theory', teacher: 'Dr. Siddharth Arora', sections: ['605A'], institution: 'college' },
  { id: 'SUB004', code: 'OS', name: 'Operating Systems', credits: 4, type: 'Theory', teacher: 'Shabnam', sections: ['605A'], institution: 'college' },
  { id: 'SUB005', code: 'DAA', name: 'Design and Analysis of Algorithms', credits: 4, type: 'Theory', teacher: 'Shaqlain', sections: ['605A'], institution: 'college' },
  { id: 'SUB006', code: 'JAVA', name: 'Java', credits: 4, type: 'Theory', teacher: 'Subham K Mishra', sections: ['605A'], institution: 'college' },
  { id: 'SUB007', code: 'SS', name: 'Soft Skills', credits: 2, type: 'Theory', teacher: 'Komal Dhiman', sections: ['605A'], institution: 'college' },
  { id: 'SUB008', code: 'APT', name: 'Aptitude', credits: 2, type: 'Theory', teacher: 'Ashish Agrawal', sections: ['605A'], institution: 'college' },
  { id: 'SUB009', code: 'ML', name: 'Intro to Machine Learning', credits: 3, type: 'Theory', teacher: 'Neeraj', sections: ['605A'], institution: 'college' },
  { id: 'SUB010', code: 'DAA-LAB', name: 'DAA Lab', credits: 2, type: 'Lab', teacher: 'Shaqlain', sections: ['605A'], institution: 'college' },
  { id: 'SUB011', code: 'JAVA-LAB', name: 'Java Lab', credits: 2, type: 'Lab', teacher: 'Subham K Mishra', sections: ['605A'], institution: 'college' },

  // ── School Class 12A subjects ─────────────────────────────────────────────
  { id: 'SCH-SUB001', code: 'PHY', name: 'Physics', credits: 5, type: 'Theory', teacher: 'Mrs. Sharma', sections: ['12A'], institution: 'school' },
  { id: 'SCH-SUB002', code: 'CHEM', name: 'Chemistry', credits: 5, type: 'Theory', teacher: 'Mr. Patel', sections: ['12A'], institution: 'school' },
  { id: 'SCH-SUB003', code: 'MATH', name: 'Mathematics', credits: 5, type: 'Theory', teacher: 'Mrs. Sharma', sections: ['12A'], institution: 'school' },
  { id: 'SCH-SUB004', code: 'ENG', name: 'English', credits: 4, type: 'Theory', teacher: 'Ms. Reddy', sections: ['12A'], institution: 'school' },
  { id: 'SCH-SUB005', code: 'CS', name: 'Computer Science', credits: 4, type: 'Theory', teacher: 'Mr. Kumar', sections: ['12A'], institution: 'school' },
  { id: 'SCH-SUB006', code: 'CS-LAB', name: 'Computer Science Lab', credits: 2, type: 'Lab', teacher: 'Mr. Kumar', sections: ['12A'], institution: 'school' },
  { id: 'SCH-SUB007', code: 'PE', name: 'Physical Education', credits: 2, type: 'Theory', teacher: 'Mrs. Gupta', sections: ['12A'], institution: 'school' },
];

const timetableSlots = [
  { id: 'TT001', section: '605A', day: 'Monday', slot: 1, time: '09:30 - 10:20', subject: 'Full Stack', teacher: 'Juned', room: '208', type: 'Lecture' },
  { id: 'TT002', section: '605A', day: 'Monday', slot: 2, time: '10:20 - 11:10', subject: 'Competitive Coding', teacher: 'Shivam', room: '208', type: 'Lecture' },
  { id: 'TT003', section: '605A', day: 'Monday', slot: 3, time: '11:20 - 12:10', subject: 'Software Engineering', teacher: 'Dr. Siddharth Arora', room: '208', type: 'Lecture' },
  { id: 'TT004', section: '605A', day: 'Monday', slot: 6, time: '01:55 - 02:45', subject: 'Soft Skills', teacher: 'Komal Dhiman', room: '208', type: 'Lecture' },
  { id: 'TT005', section: '605A', day: 'Tuesday', slot: 1, time: '09:30 - 10:20', subject: 'DAA Lab', teacher: 'Shaqlain', room: 'Lab 3', type: 'Lab' },
  { id: 'TT006', section: '605A', day: 'Tuesday', slot: 2, time: '10:20 - 11:10', subject: 'Operating Systems', teacher: 'Shabnam', room: '208', type: 'Lecture' },
  { id: 'TT007', section: '605A', day: 'Tuesday', slot: 3, time: '11:20 - 12:10', subject: 'DAA', teacher: 'Shaqlain', room: '208', type: 'Lecture' },
  { id: 'TT008', section: '605A', day: 'Tuesday', slot: 7, time: '02:45 - 03:35', subject: 'Soft Skills', teacher: 'Komal Dhiman', room: '208', type: 'Lecture' },
  { id: 'TT009', section: '605A', day: 'Wednesday', slot: 1, time: '09:30 - 10:20', subject: 'DAA', teacher: 'Shaqlain', room: '208', type: 'Lecture' },
  { id: 'TT010', section: '605A', day: 'Wednesday', slot: 2, time: '10:20 - 11:10', subject: 'Operating Systems', teacher: 'Shabnam', room: '208', type: 'Lecture' },
  { id: 'TT011', section: '605A', day: 'Wednesday', slot: 3, time: '11:20 - 12:10', subject: 'Java', teacher: 'Subham K Mishra', room: '208', type: 'Lecture' },
  { id: 'TT012', section: '605A', day: 'Wednesday', slot: 4, time: '12:10 - 01:00', subject: 'Software Engineering', teacher: 'Dr. Siddharth Arora', room: '208', type: 'Lecture' },
  { id: 'TT013', section: '605A', day: 'Wednesday', slot: 6, time: '01:55 - 02:45', subject: 'Aptitude', teacher: 'Ashish Agrawal', room: '208', type: 'Lecture' },
  { id: 'TT014', section: '605A', day: 'Thursday', slot: 1, time: '09:30 - 10:20', subject: 'Java Lab', teacher: 'Subham K Mishra', room: 'Lab 2', type: 'Lab' },
  { id: 'TT015', section: '605A', day: 'Thursday', slot: 2, time: '10:20 - 11:10', subject: 'Operating Systems', teacher: 'Shabnam', room: '208', type: 'Lecture' },
  { id: 'TT016', section: '605A', day: 'Thursday', slot: 3, time: '11:20 - 12:10', subject: 'DAA', teacher: 'Shaqlain', room: '208', type: 'Lecture' },
  { id: 'TT017', section: '605A', day: 'Thursday', slot: 4, time: '12:10 - 01:00', subject: 'Software Engineering', teacher: 'Dr. Siddharth Arora', room: '208', type: 'Lecture' },
  { id: 'TT018', section: '605A', day: 'Thursday', slot: 6, time: '01:55 - 02:45', subject: 'Aptitude', teacher: 'Ashish Agrawal', room: '208', type: 'Lecture' },
  { id: 'TT019', section: '605A', day: 'Friday', slot: 1, time: '09:30 - 10:20', subject: 'Full Stack', teacher: 'Juned', room: '208', type: 'Lecture' },
  { id: 'TT020', section: '605A', day: 'Friday', slot: 2, time: '10:20 - 11:10', subject: 'Java', teacher: 'Subham K Mishra', room: '208', type: 'Lecture' },
  { id: 'TT021', section: '605A', day: 'Friday', slot: 5, time: '01:05 - 01:55', subject: 'Intro to ML', teacher: 'Neeraj', room: '208', type: 'Lecture' },
];

const seedCollection = async (collectionName, items) => {
  const batch = writeBatch(db);
  items.forEach(item => batch.set(doc(db, collectionName, item.id), item));
  await batch.commit();
  console.log(`✅ Seeded ${items.length} docs into '${collectionName}'`);
};

// ── Section 12A (school students — same names as 605A, school institution) ──
const schoolStudents12A = [
  { id: 'SCH12A001', uid: 'SCH-12A-001', name: 'Rohit Raj',            section: '12A', year: 'Class 12', email: 'rohit.raj@dps.edu',            parentEmail: 'parent.rohitraj@gmail.com',         faceRegistered: false, institution: 'school' },
  { id: 'SCH12A002', uid: 'SCH-12A-002', name: 'Himanshu Kumar',       section: '12A', year: 'Class 12', email: 'himanshu.kumar@dps.edu',        parentEmail: 'parent.himanshu@gmail.com',          faceRegistered: false, institution: 'school' },
  { id: 'SCH12A003', uid: 'SCH-12A-003', name: 'Diya Sharma',          section: '12A', year: 'Class 12', email: 'diya.sharma@dps.edu',           parentEmail: 'parent.diyasharma@gmail.com',        faceRegistered: false, institution: 'school' },
  { id: 'SCH12A004', uid: 'SCH-12A-004', name: 'Aashu Babu',           section: '12A', year: 'Class 12', email: 'aashu.babu@dps.edu',            parentEmail: 'parent.aashubabu@gmail.com',         faceRegistered: false, institution: 'school' },
  { id: 'SCH12A005', uid: 'SCH-12A-005', name: 'Karan Kumar',          section: '12A', year: 'Class 12', email: 'karan.kumar@dps.edu',           parentEmail: 'parent.karankumar@gmail.com',        faceRegistered: false, institution: 'school' },
  { id: 'SCH12A006', uid: 'SCH-12A-006', name: 'Prakhar Sisodiya',     section: '12A', year: 'Class 12', email: 'prakhar.sisodiya@dps.edu',      parentEmail: 'parent.prakhar@gmail.com',           faceRegistered: false, institution: 'school' },
  { id: 'SCH12A007', uid: 'SCH-12A-007', name: 'Harshpreet Kaur',      section: '12A', year: 'Class 12', email: 'harshpreet.kaur@dps.edu',       parentEmail: 'parent.harshpreet@gmail.com',        faceRegistered: false, institution: 'school' },
  { id: 'SCH12A008', uid: 'SCH-12A-008', name: 'Sahilpreet Singh',     section: '12A', year: 'Class 12', email: 'sahilpreet.singh@dps.edu',      parentEmail: 'parent.sahilpreet@gmail.com',        faceRegistered: false, institution: 'school' },
  { id: 'SCH12A009', uid: 'SCH-12A-009', name: 'Naveen',               section: '12A', year: 'Class 12', email: 'naveen@dps.edu',                parentEmail: 'parent.naveen@gmail.com',            faceRegistered: false, institution: 'school' },
  { id: 'SCH12A010', uid: 'SCH-12A-010', name: 'Shreya Kumari',        section: '12A', year: 'Class 12', email: 'shreya.kumari@dps.edu',         parentEmail: 'parent.shreyakumari@gmail.com',      faceRegistered: false, institution: 'school' },
  { id: 'SCH12A011', uid: 'SCH-12A-011', name: 'Bhumika',              section: '12A', year: 'Class 12', email: 'bhumika@dps.edu',               parentEmail: 'parent.bhumika@gmail.com',           faceRegistered: false, institution: 'school' },
  { id: 'SCH12A012', uid: 'SCH-12A-012', name: 'Vishal Kumar',         section: '12A', year: 'Class 12', email: 'vishal.kumar@dps.edu',          parentEmail: 'parent.vishalkumar@gmail.com',       faceRegistered: false, institution: 'school' },
  { id: 'SCH12A013', uid: 'SCH-12A-013', name: 'Shagun Jangra',        section: '12A', year: 'Class 12', email: 'shagun.jangra@dps.edu',         parentEmail: 'parent.shagun@gmail.com',            faceRegistered: false, institution: 'school' },
  { id: 'SCH12A014', uid: 'SCH-12A-014', name: 'Dutimaya Pradhan',     section: '12A', year: 'Class 12', email: 'dutimaya.pradhan@dps.edu',      parentEmail: 'parent.dutimaya@gmail.com',          faceRegistered: false, institution: 'school' },
  { id: 'SCH12A015', uid: 'SCH-12A-015', name: 'Shchi Sharda',         section: '12A', year: 'Class 12', email: 'shchi.sharda@dps.edu',          parentEmail: 'parent.shchi@gmail.com',             faceRegistered: false, institution: 'school' },
  { id: 'SCH12A016', uid: 'SCH-12A-016', name: 'Rishav Kumar',         section: '12A', year: 'Class 12', email: 'rishav.kumar@dps.edu',          parentEmail: 'parent.rishav@gmail.com',            faceRegistered: false, institution: 'school' },
  { id: 'SCH12A017', uid: 'SCH-12A-017', name: 'Shivam Bind',          section: '12A', year: 'Class 12', email: 'shivam.bind@dps.edu',           parentEmail: 'parent.shivambind@gmail.com',        faceRegistered: false, institution: 'school' },
  { id: 'SCH12A018', uid: 'SCH-12A-018', name: 'Priyanshu Bindal',     section: '12A', year: 'Class 12', email: 'priyanshu.bindal@dps.edu',      parentEmail: 'parent.priyanshu@gmail.com',         faceRegistered: false, institution: 'school' },
  { id: 'SCH12A019', uid: 'SCH-12A-019', name: 'Shreya',               section: '12A', year: 'Class 12', email: 'shreya@dps.edu',                parentEmail: 'parent.shreya@gmail.com',            faceRegistered: false, institution: 'school' },
  { id: 'SCH12A020', uid: 'SCH-12A-020', name: 'Garima Sharma',        section: '12A', year: 'Class 12', email: 'garima.sharma@dps.edu',         parentEmail: 'parent.garima@gmail.com',            faceRegistered: false, institution: 'school' },
  { id: 'SCH12A021', uid: 'SCH-12A-021', name: 'Samar Kumar',          section: '12A', year: 'Class 12', email: 'samar.kumar@dps.edu',           parentEmail: 'parent.samar@gmail.com',             faceRegistered: false, institution: 'school' },
  { id: 'SCH12A022', uid: 'SCH-12A-022', name: 'Lucky',                section: '12A', year: 'Class 12', email: 'lucky@dps.edu',                 parentEmail: 'parent.lucky@gmail.com',             faceRegistered: false, institution: 'school' },
  { id: 'SCH12A023', uid: 'SCH-12A-023', name: 'Muskaan Rajora',       section: '12A', year: 'Class 12', email: 'muskaan.rajora@dps.edu',        parentEmail: 'parent.muskaan@gmail.com',           faceRegistered: false, institution: 'school' },
  { id: 'SCH12A024', uid: 'SCH-12A-024', name: 'Ankit Kumar',          section: '12A', year: 'Class 12', email: 'ankit.kumar@dps.edu',           parentEmail: 'parent.ankit@gmail.com',             faceRegistered: false, institution: 'school' },
  { id: 'SCH12A025', uid: 'SCH-12A-025', name: 'Saatvik Sawarn',       section: '12A', year: 'Class 12', email: 'saatvik.sawarn@dps.edu',        parentEmail: 'parent.saatvik@gmail.com',           faceRegistered: false, institution: 'school' },
  { id: 'SCH12A026', uid: 'SCH-12A-026', name: 'Paras',                section: '12A', year: 'Class 12', email: 'paras@dps.edu',                 parentEmail: 'parent.paras@gmail.com',             faceRegistered: false, institution: 'school' },
  { id: 'SCH12A027', uid: 'SCH-12A-027', name: 'Shivam Jaiswal',       section: '12A', year: 'Class 12', email: 'shivam.jaiswal@dps.edu',        parentEmail: 'parent.shivamjaiswal@gmail.com',     faceRegistered: false, institution: 'school' },
  { id: 'SCH12A028', uid: 'SCH-12A-028', name: 'Yash Kumar Sisodia',   section: '12A', year: 'Class 12', email: 'yash.sisodia@dps.edu',          parentEmail: 'parent.yash@gmail.com',              faceRegistered: false, institution: 'school' },
  { id: 'SCH12A029', uid: 'SCH-12A-029', name: 'Akshata Singh',        section: '12A', year: 'Class 12', email: 'akshata.singh@dps.edu',         parentEmail: 'parent.akshata@gmail.com',           faceRegistered: false, institution: 'school' },
  { id: 'SCH12A030', uid: 'SCH-12A-030', name: 'Love Bhardwaj',        section: '12A', year: 'Class 12', email: 'love.bhardwaj@dps.edu',         parentEmail: 'parent.love@gmail.com',              faceRegistered: false, institution: 'school' },
  { id: 'SCH12A031', uid: 'SCH-12A-031', name: 'Divyanshu Kumar',      section: '12A', year: 'Class 12', email: 'divyanshu.kumar@dps.edu',       parentEmail: 'parent.divyanshu@gmail.com',         faceRegistered: false, institution: 'school' },
  { id: 'SCH12A032', uid: 'SCH-12A-032', name: 'Aditya Raj',           section: '12A', year: 'Class 12', email: 'aditya.raj@dps.edu',            parentEmail: 'parent.adityaraj@gmail.com',         faceRegistered: false, institution: 'school' },
  { id: 'SCH12A033', uid: 'SCH-12A-033', name: 'Aarav Sharma',         section: '12A', year: 'Class 12', email: 'aarav.sharma@dps.edu',          parentEmail: 'parent.aarav@gmail.com',             faceRegistered: false, institution: 'school' },
  { id: 'SCH12A034', uid: 'SCH-12A-034', name: 'Rudra Pratap Singh',   section: '12A', year: 'Class 12', email: 'rudra.singh@dps.edu',           parentEmail: 'parent.rudra@gmail.com',             faceRegistered: false, institution: 'school' },
  { id: 'SCH12A035', uid: 'SCH-12A-035', name: 'Kumari Riya',          section: '12A', year: 'Class 12', email: 'kumari.riya@dps.edu',           parentEmail: 'parent.riya@gmail.com',              faceRegistered: false, institution: 'school' },
];

// Re-seed only students (safe to run anytime — overwrites existing docs by ID)
export const reseedStudents = async () => {
  console.log('🌱 Re-seeding students...');
  await seedCollection('students', students);
  console.log('✅ Students updated!');
};

// Seed school 12A students
export const reseedSchoolStudents = async () => {
  console.log('🌱 Re-seeding school 12A students...');
  await seedCollection('students', schoolStudents12A);
  console.log('✅ School 12A students updated!');
};

// Seed school 12A subjects
export const reseedSchoolSubjects = async () => {
  console.log('🌱 Re-seeding school 12A subjects...');
  const schoolSubs = subjects.filter(s => s.institution === 'school');
  await seedCollection('subjects', schoolSubs);
  console.log('✅ School 12A subjects updated!');
};

export const seedAll = async () => {
  console.log('🌱 Starting Firestore seed...');

  // 1. Seed static collections
  await seedCollection('students', students);
  await seedCollection('subjects', subjects);
  await seedCollection('timetable', timetableSlots);

  // 2. Create Firebase Auth accounts + write profiles keyed by UID
  console.log('👤 Creating Firebase Auth accounts...');
  for (const profile of userProfiles) {
    try {
      let uid;
      try {
        // Try creating new account
        const cred = await createUserWithEmailAndPassword(auth, profile.email, profile.password);
        uid = cred.user.uid;
        console.log(`  ✅ Created auth: ${profile.email}`);
      } catch (e) {
        if (e.code === 'auth/email-already-in-use') {
          // Already exists — sign in to get UID
          const cred = await signInWithEmailAndPassword(auth, profile.email, profile.password);
          uid = cred.user.uid;
          console.log(`  ℹ️ Already exists: ${profile.email}`);
        } else {
          throw e;
        }
      }
      // Write profile to Firestore keyed by Firebase UID
      const { password: _, ...safeProfile } = profile;
      await setDoc(doc(db, 'users', uid), { ...safeProfile, uid });
    } catch (err) {
      console.error(`  ❌ Failed for ${profile.email}:`, err.message);
    }
  }

  console.log('🎉 Seed complete!');
};
