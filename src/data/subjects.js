// Chandigarh University - CSE 2nd Year Subjects

export const SUBJECTS = [
  { id: 'SUB001', code: 'FS', name: 'Full Stack', credits: 4, type: 'Theory' },
  { id: 'SUB002', code: 'CC', name: 'Competitive Coding', credits: 2, type: 'Theory' },
  { id: 'SUB003', code: 'SE', name: 'Software Engineering', credits: 4, type: 'Theory' },
  { id: 'SUB004', code: 'OS', name: 'Operating Systems', credits: 4, type: 'Theory' },
  { id: 'SUB005', code: 'DAA', name: 'Design and Analysis of Algorithms', credits: 4, type: 'Theory' },
  { id: 'SUB006', code: 'JAVA', name: 'Java', credits: 4, type: 'Theory' },
  { id: 'SUB007', code: 'SS', name: 'Soft Skills', credits: 2, type: 'Theory' },
  { id: 'SUB008', code: 'APT', name: 'Aptitude', credits: 2, type: 'Theory' },
  { id: 'SUB009', code: 'ML', name: 'Intro to Machine Learning', credits: 3, type: 'Theory' },
  { id: 'SUB010', code: 'DAA-LAB', name: 'DAA Lab', credits: 2, type: 'Lab' },
  { id: 'SUB011', code: 'JAVA-LAB', name: 'Java Lab', credits: 2, type: 'Lab' },
];

export const getSubjectByName = (name) => {
  return SUBJECTS.find(s => s.name === name || s.name.includes(name));
};

export const getSubjectByCode = (code) => {
  return SUBJECTS.find(s => s.code === code);
};

export const getLabSubjects = () => {
  return SUBJECTS.filter(s => s.type === 'Lab');
};

export const getTheorySubjects = () => {
  return SUBJECTS.filter(s => s.type === 'Theory');
};
