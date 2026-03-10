// Chandigarh University - CSE 2nd Year Teachers
// Extracted from timetable PDF

export const TEACHERS = [
  { 
    id: 'T001', 
    employeeId: 'CU-FAC-001',
    name: 'Juned', 
    fullName: 'Prof. Juned Khan',
    subject: 'Full Stack', 
    email: 'juned@cumail.in',
    phone: '+91-98765-43220',
    office: 'Block A, Room 301',
    department: 'Computer Science & Engineering'
  },
  { 
    id: 'T002', 
    employeeId: 'CU-FAC-002',
    name: 'Shivam', 
    fullName: 'Prof. Shivam Gupta',
    subject: 'Competitive Coding', 
    email: 'shivam@cumail.in',
    phone: '+91-98765-43221',
    office: 'Block A, Room 302',
    department: 'Computer Science & Engineering'
  },
  { 
    id: 'T003', 
    employeeId: 'CU-FAC-003',
    name: 'Komal Dhiman', 
    fullName: 'Dr. Komal Dhiman',
    subject: 'Soft Skills', 
    email: 'komal.dhiman@cumail.in',
    phone: '+91-98765-43222',
    office: 'Block B, Room 201',
    department: 'Humanities'
  },
  { 
    id: 'T004', 
    employeeId: 'CU-FAC-004',
    name: 'Dr. Siddharth Arora', 
    fullName: 'Dr. Siddharth Arora',
    subject: 'Software Engineering', 
    email: 'siddharth.arora@cumail.in',
    phone: '+91-98765-43223',
    office: 'Block A, Room 303',
    department: 'Computer Science & Engineering'
  },
  { 
    id: 'T005', 
    employeeId: 'CU-FAC-005',
    name: 'Shabnam', 
    fullName: 'Prof. Shabnam Patel',
    subject: 'Operating Systems', 
    email: 'shabnam@cumail.in',
    phone: '+91-98765-43224',
    office: 'Block A, Room 304',
    department: 'Computer Science & Engineering'
  },
  { 
    id: 'T006', 
    employeeId: 'CU-FAC-006',
    name: 'Shaqlain', 
    fullName: 'Prof. Shaqlain Ahmed',
    subject: 'DAA', 
    email: 'shaqlain@cumail.in',
    phone: '+91-98765-43225',
    office: 'Block A, Room 305',
    department: 'Computer Science & Engineering'
  },
  { 
    id: 'T007', 
    employeeId: 'CU-FAC-007',
    name: 'Subham K Mishra', 
    fullName: 'Prof. Subham Kumar Mishra',
    subject: 'Java', 
    email: 'subham.mishra@cumail.in',
    phone: '+91-98765-43226',
    office: 'Block A, Room 306',
    department: 'Computer Science & Engineering'
  },
  { 
    id: 'T008', 
    employeeId: 'CU-FAC-008',
    name: 'Ashish Agrawal', 
    fullName: 'Prof. Ashish Agrawal',
    subject: 'Aptitude', 
    email: 'ashish.agrawal@cumail.in',
    phone: '+91-98765-43227',
    office: 'Block C, Room 101',
    department: 'Training & Placement'
  },
  { 
    id: 'T009', 
    employeeId: 'CU-FAC-009',
    name: 'Neeraj', 
    fullName: 'Dr. Neeraj Verma',
    subject: 'Intro to ML', 
    email: 'neeraj@cumail.in',
    phone: '+91-98765-43228',
    office: 'Block A, Room 307',
    department: 'Computer Science & Engineering'
  },
];

export const getTeacherByName = (name) => {
  return TEACHERS.find(t => t.name === name);
};

export const getTeachersBySubject = (subject) => {
  return TEACHERS.filter(t => t.subject === subject);
};
