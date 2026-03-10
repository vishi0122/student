// Chandigarh University - CSE 2nd Year Sections

export const SECTIONS = [
  { id: 'SEC001', code: '24BCS_KRG_601A', name: '601A', year: '2nd Year', department: 'CSE', strength: 60 },
  { id: 'SEC002', code: '24BCS_KRG_601B', name: '601B', year: '2nd Year', department: 'CSE', strength: 60 },
  { id: 'SEC003', code: '24BCS_TPP_602', name: '602', year: '2nd Year', department: 'CSE', strength: 60 },
  { id: 'SEC004', code: '24BCS_TPP_603', name: '603', year: '2nd Year', department: 'CSE', strength: 60 },
  { id: 'SEC005', code: '24BCS_TPP_604', name: '604', year: '2nd Year', department: 'CSE', strength: 60 },
  { id: 'SEC006', code: '24BCS_TPP_605', name: '605', year: '2nd Year', department: 'CSE', strength: 60 },
  { id: 'SEC007', code: '24BCS_TPP_606', name: '606', year: '2nd Year', department: 'CSE', strength: 60 },
  { id: 'SEC008', code: '24BCS_TPP_607', name: '607', year: '2nd Year', department: 'CSE', strength: 60 },
];

export const getSectionByCode = (code) => {
  return SECTIONS.find(s => s.code === code || s.name === code);
};

export const getSectionsByDepartment = (department) => {
  return SECTIONS.filter(s => s.department === department);
};
