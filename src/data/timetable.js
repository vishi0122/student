// Chandigarh University - CSE 2nd Year Timetable
// Section: 24BCS_KRG_601A

export const TIMETABLE_601A = {
  Monday: [
    { slot: 1, time: '09:30 - 10:20', subject: 'Full Stack', teacher: 'Juned', room: '208', type: 'Lecture' },
    { slot: 2, time: '10:20 - 11:10', subject: 'Competitive Coding', teacher: 'Shivam', room: '208', type: 'Lecture' },
    { slot: 3, time: '11:20 - 12:10', subject: 'Software Engineering', teacher: 'Dr. Siddharth Arora', room: '208', type: 'Lecture' },
    { slot: 4, time: '12:10 - 01:00', subject: 'Break', teacher: null, room: null, type: 'Break' },
    { slot: 6, time: '01:55 - 02:45', subject: 'Soft Skills', teacher: 'Komal Dhiman', room: '208', type: 'Lecture' },
  ],
  Tuesday: [
    { slot: 1, time: '09:30 - 10:20', subject: 'DAA Lab', teacher: 'Shaqlain', room: 'Lab 3', type: 'Lab' },
    { slot: 2, time: '10:20 - 11:10', subject: 'Operating Systems', teacher: 'Shabnam', room: '208', type: 'Lecture' },
    { slot: 3, time: '11:20 - 12:10', subject: 'DAA', teacher: 'Shaqlain', room: '208', type: 'Lecture' },
    { slot: 4, time: '12:10 - 01:00', subject: 'Break', teacher: null, room: null, type: 'Break' },
    { slot: 7, time: '02:45 - 03:35', subject: 'Soft Skills', teacher: 'Komal Dhiman', room: '208', type: 'Lecture' },
  ],
  Wednesday: [
    { slot: 1, time: '09:30 - 10:20', subject: 'DAA', teacher: 'Shaqlain', room: '208', type: 'Lecture' },
    { slot: 2, time: '10:20 - 11:10', subject: 'Operating Systems', teacher: 'Shabnam', room: '208', type: 'Lecture' },
    { slot: 3, time: '11:20 - 12:10', subject: 'Java', teacher: 'Subham K Mishra', room: '208', type: 'Lecture' },
    { slot: 4, time: '12:10 - 01:00', subject: 'Software Engineering', teacher: 'Dr. Siddharth Arora', room: '208', type: 'Lecture' },
    { slot: 6, time: '01:55 - 02:45', subject: 'Aptitude', teacher: 'Ashish Agrawal', room: '208', type: 'Lecture' },
  ],
  Thursday: [
    { slot: 1, time: '09:30 - 10:20', subject: 'Java Lab', teacher: 'Subham K Mishra', room: 'Lab 2', type: 'Lab' },
    { slot: 2, time: '10:20 - 11:10', subject: 'Operating Systems', teacher: 'Shabnam', room: '208', type: 'Lecture' },
    { slot: 3, time: '11:20 - 12:10', subject: 'DAA', teacher: 'Shaqlain', room: '208', type: 'Lecture' },
    { slot: 4, time: '12:10 - 01:00', subject: 'Software Engineering', teacher: 'Dr. Siddharth Arora', room: '208', type: 'Lecture' },
    { slot: 6, time: '01:55 - 02:45', subject: 'Aptitude', teacher: 'Ashish Agrawal', room: '208', type: 'Lecture' },
  ],
  Friday: [
    { slot: 1, time: '09:30 - 10:20', subject: 'Full Stack', teacher: 'Juned', room: '208', type: 'Lecture' },
    { slot: 2, time: '10:20 - 11:10', subject: 'Java', teacher: 'Subham K Mishra', room: '208', type: 'Lecture' },
    { slot: 3, time: '11:20 - 12:10', subject: 'Break', teacher: null, room: null, type: 'Break' },
    { slot: 5, time: '01:05 - 01:55', subject: 'Intro to ML', teacher: 'Neeraj', room: '208', type: 'Lecture' },
  ],
};

// Get current lecture based on day and time
export const getCurrentLecture = (section = '601A', day, timeSlot) => {
  const timetable = TIMETABLE_601A; // Can be extended for other sections
  const daySchedule = timetable[day];
  
  if (!daySchedule) return null;
  
  return daySchedule.find(lecture => lecture.slot === timeSlot);
};

// Get all lectures for a specific day
export const getLecturesByDay = (section = '601A', day) => {
  return TIMETABLE_601A[day] || [];
};

// Get all lectures for a specific teacher
export const getLecturesByTeacher = (teacherName) => {
  const allLectures = [];
  
  Object.entries(TIMETABLE_601A).forEach(([day, lectures]) => {
    lectures.forEach(lecture => {
      if (lecture.teacher === teacherName) {
        allLectures.push({ ...lecture, day });
      }
    });
  });
  
  return allLectures;
};

// Get all lectures for a specific subject
export const getLecturesBySubject = (subjectName) => {
  const allLectures = [];
  
  Object.entries(TIMETABLE_601A).forEach(([day, lectures]) => {
    lectures.forEach(lecture => {
      if (lecture.subject === subjectName) {
        allLectures.push({ ...lecture, day });
      }
    });
  });
  
  return allLectures;
};

// Firebase-ready format
export const getTimetableForFirebase = (section = '601A') => {
  const firebaseData = [];
  
  Object.entries(TIMETABLE_601A).forEach(([day, lectures]) => {
    lectures.forEach(lecture => {
      if (lecture.type !== 'Break') {
        firebaseData.push({
          section: `24BCS_KRG_${section}`,
          day,
          slot: lecture.slot,
          time: lecture.time,
          subject: lecture.subject,
          teacher: lecture.teacher,
          room: lecture.room,
          type: lecture.type,
        });
      }
    });
  });
  
  return firebaseData;
};
