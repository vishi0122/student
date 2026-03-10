// System Users with Authentication Credentials
// ⚠️ In production, passwords should be hashed and stored in Firebase Authentication

export const USERS = [
  // College Admin
  {
    id: 'USER-001',
    employeeId: 'CU-ADM-001',
    username: 'admin.college@cumail.in',
    email: 'admin.college@cumail.in',
    password: 'CU@Admin2024', // Will be hashed in production
    role: 'admin',
    instType: 'college',
    name: 'Dr. Priya Sharma',
    phone: '+91-98765-43211',
    department: 'CSE Administration',
    institution: 'Chandigarh University'
  },
  
  // School Admin
  {
    id: 'USER-002',
    employeeId: 'DPS-ADM-001',
    username: 'admin.school@dps.edu',
    email: 'admin.school@dps.edu',
    password: 'School@2024',
    role: 'admin',
    instType: 'school',
    name: 'Dr. Rajesh Kumar',
    phone: '+91-98765-43210',
    department: 'Administration',
    institution: 'Delhi Public School'
  },

  // College Faculty - Juned (Full Stack)
  {
    id: 'USER-003',
    employeeId: 'CU-FAC-001',
    username: 'juned@cumail.in',
    email: 'juned@cumail.in',
    password: 'Juned@FS2024',
    role: 'faculty',
    instType: 'college',
    name: 'Juned',
    fullName: 'Prof. Juned Khan',
    phone: '+91-98765-43220',
    office: 'Block A, Room 301',
    department: 'Computer Science & Engineering',
    institution: 'Chandigarh University',
    subjects: ['Full Stack'],
    sections: ['601A', '601B']
  },

  // College Faculty - Shivam (Competitive Coding)
  {
    id: 'USER-004',
    employeeId: 'CU-FAC-002',
    username: 'shivam@cumail.in',
    email: 'shivam@cumail.in',
    password: 'Shivam@CC2024',
    role: 'faculty',
    instType: 'college',
    name: 'Shivam',
    fullName: 'Prof. Shivam Gupta',
    phone: '+91-98765-43221',
    office: 'Block A, Room 302',
    department: 'Computer Science & Engineering',
    institution: 'Chandigarh University',
    subjects: ['Competitive Coding'],
    sections: ['601A', '601B']
  },

  // College Faculty - Komal Dhiman (Soft Skills)
  {
    id: 'USER-005',
    employeeId: 'CU-FAC-003',
    username: 'komal.dhiman@cumail.in',
    email: 'komal.dhiman@cumail.in',
    password: 'Komal@SS2024',
    role: 'faculty',
    instType: 'college',
    name: 'Komal Dhiman',
    fullName: 'Dr. Komal Dhiman',
    phone: '+91-98765-43222',
    office: 'Block B, Room 201',
    department: 'Humanities',
    institution: 'Chandigarh University',
    subjects: ['Soft Skills'],
    sections: ['601A', '601B', '602']
  },

  // College Faculty - Dr. Siddharth Arora (Software Engineering)
  {
    id: 'USER-006',
    employeeId: 'CU-FAC-004',
    username: 'siddharth.arora@cumail.in',
    email: 'siddharth.arora@cumail.in',
    password: 'Siddharth@SE2024',
    role: 'faculty',
    instType: 'college',
    name: 'Dr. Siddharth Arora',
    fullName: 'Dr. Siddharth Arora',
    phone: '+91-98765-43223',
    office: 'Block A, Room 303',
    department: 'Computer Science & Engineering',
    institution: 'Chandigarh University',
    subjects: ['Software Engineering'],
    sections: ['601A', '601B']
  },

  // College Faculty - Shabnam (Operating Systems)
  {
    id: 'USER-007',
    employeeId: 'CU-FAC-005',
    username: 'shabnam@cumail.in',
    email: 'shabnam@cumail.in',
    password: 'Shabnam@OS2024',
    role: 'faculty',
    instType: 'college',
    name: 'Shabnam',
    fullName: 'Prof. Shabnam Patel',
    phone: '+91-98765-43224',
    office: 'Block A, Room 304',
    department: 'Computer Science & Engineering',
    institution: 'Chandigarh University',
    subjects: ['Operating Systems'],
    sections: ['601A', '601B', '602']
  },

  // College Faculty - Shaqlain (DAA)
  {
    id: 'USER-008',
    employeeId: 'CU-FAC-006',
    username: 'shaqlain@cumail.in',
    email: 'shaqlain@cumail.in',
    password: 'Shaqlain@DAA2024',
    role: 'faculty',
    instType: 'college',
    name: 'Shaqlain',
    fullName: 'Prof. Shaqlain Ahmed',
    phone: '+91-98765-43225',
    office: 'Block A, Room 305',
    department: 'Computer Science & Engineering',
    institution: 'Chandigarh University',
    subjects: ['Design and Analysis of Algorithms', 'DAA Lab'],
    sections: ['601A', '601B']
  },

  // College Faculty - Subham K Mishra (Java)
  {
    id: 'USER-009',
    employeeId: 'CU-FAC-007',
    username: 'subham.mishra@cumail.in',
    email: 'subham.mishra@cumail.in',
    password: 'Subham@Java2024',
    role: 'faculty',
    instType: 'college',
    name: 'Subham K Mishra',
    fullName: 'Prof. Subham Kumar Mishra',
    phone: '+91-98765-43226',
    office: 'Block A, Room 306',
    department: 'Computer Science & Engineering',
    institution: 'Chandigarh University',
    subjects: ['Java', 'Java Lab'],
    sections: ['601A', '601B', '602']
  },

  // College Faculty - Ashish Agrawal (Aptitude)
  {
    id: 'USER-010',
    employeeId: 'CU-FAC-008',
    username: 'ashish.agrawal@cumail.in',
    email: 'ashish.agrawal@cumail.in',
    password: 'Ashish@APT2024',
    role: 'faculty',
    instType: 'college',
    name: 'Ashish Agrawal',
    fullName: 'Prof. Ashish Agrawal',
    phone: '+91-98765-43227',
    office: 'Block C, Room 101',
    department: 'Training & Placement',
    institution: 'Chandigarh University',
    subjects: ['Aptitude'],
    sections: ['601A', '601B', '602', '603']
  },

  // College Faculty - Neeraj (Intro to ML)
  {
    id: 'USER-011',
    employeeId: 'CU-FAC-009',
    username: 'neeraj@cumail.in',
    email: 'neeraj@cumail.in',
    password: 'Neeraj@ML2024',
    role: 'faculty',
    instType: 'college',
    name: 'Neeraj',
    fullName: 'Dr. Neeraj Verma',
    phone: '+91-98765-43228',
    office: 'Block A, Room 307',
    department: 'Computer Science & Engineering',
    institution: 'Chandigarh University',
    subjects: ['Intro to Machine Learning'],
    sections: ['601A', '601B']
  },

  // School Faculty - Mrs. Sharma (Mathematics)
  {
    id: 'USER-012',
    employeeId: 'DPS-FAC-001',
    username: 'sharma.math@dps.edu',
    email: 'sharma.math@dps.edu',
    password: 'Sharma@Math2024',
    role: 'faculty',
    instType: 'school',
    name: 'Mrs. Sharma',
    fullName: 'Mrs. Anita Sharma',
    phone: '+91-98765-43230',
    department: 'Science & Mathematics',
    institution: 'Delhi Public School',
    subjects: ['Mathematics'],
    classes: ['Class 10-A']
  },

  // School Faculty - Mr. Patel (Science)
  {
    id: 'USER-013',
    employeeId: 'DPS-FAC-002',
    username: 'patel.science@dps.edu',
    email: 'patel.science@dps.edu',
    password: 'Patel@Sci2024',
    role: 'faculty',
    instType: 'school',
    name: 'Mr. Patel',
    fullName: 'Mr. Ramesh Patel',
    phone: '+91-98765-43231',
    department: 'Science & Mathematics',
    institution: 'Delhi Public School',
    subjects: ['Science'],
    classes: ['Class 10-A', 'Class 10-B']
  },

  // School Faculty - Ms. Reddy (English)
  {
    id: 'USER-014',
    employeeId: 'DPS-FAC-003',
    username: 'reddy.english@dps.edu',
    email: 'reddy.english@dps.edu',
    password: 'Reddy@Eng2024',
    role: 'faculty',
    instType: 'school',
    name: 'Ms. Reddy',
    fullName: 'Ms. Lakshmi Reddy',
    phone: '+91-98765-43232',
    department: 'Languages',
    institution: 'Delhi Public School',
    subjects: ['English'],
    classes: ['Class 10-A', 'Class 10-B', 'Class 10-C']
  },

  // School Faculty - Mr. Kumar (Social Studies)
  {
    id: 'USER-015',
    employeeId: 'DPS-FAC-004',
    username: 'kumar.social@dps.edu',
    email: 'kumar.social@dps.edu',
    password: 'Kumar@SS2024',
    role: 'faculty',
    instType: 'school',
    name: 'Mr. Kumar',
    fullName: 'Mr. Vijay Kumar',
    phone: '+91-98765-43233',
    department: 'Social Sciences',
    institution: 'Delhi Public School',
    subjects: ['Social Studies'],
    classes: ['Class 10-A', 'Class 10-B']
  },

  // School Faculty - Mrs. Gupta (Hindi)
  {
    id: 'USER-016',
    employeeId: 'DPS-FAC-005',
    username: 'gupta.hindi@dps.edu',
    email: 'gupta.hindi@dps.edu',
    password: 'Gupta@Hindi2024',
    role: 'faculty',
    instType: 'school',
    name: 'Mrs. Gupta',
    fullName: 'Mrs. Meera Gupta',
    phone: '+91-98765-43234',
    department: 'Languages',
    institution: 'Delhi Public School',
    subjects: ['Hindi'],
    classes: ['Class 10-A', 'Class 10-B']
  }
];

// Helper functions
export const getUserByEmail = (email) => {
  return USERS.find(u => u.email === email || u.username === email);
};

export const getUserByEmployeeId = (employeeId) => {
  return USERS.find(u => u.employeeId === employeeId);
};

export const authenticateUser = (email, password) => {
  const user = getUserByEmail(email);
  if (!user) return null;
  
  // In production, use proper password hashing comparison
  if (user.password === password) {
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
};

export const getFacultyBySubject = (subject) => {
  return USERS.filter(u => 
    u.role === 'faculty' && 
    u.subjects && 
    u.subjects.some(s => s.includes(subject) || subject.includes(s))
  );
};

export const getCollegeFaculty = () => {
  return USERS.filter(u => u.role === 'faculty' && u.instType === 'college');
};

export const getSchoolFaculty = () => {
  return USERS.filter(u => u.role === 'faculty' && u.instType === 'school');
};

export const getAdmins = () => {
  return USERS.filter(u => u.role === 'admin');
};
