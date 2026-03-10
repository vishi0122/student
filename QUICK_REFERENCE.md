# Quick Reference Guide - Real CU Data

## Data Files Location
All data files are in `src/data/`:

```
src/data/
├── timeSlots.js       # 8 lecture slots (9:30 AM - 4:25 PM)
├── teachers.js        # 9 teachers with subjects
├── subjects.js        # 11 subjects (Theory + Lab)
├── sections.js        # 8 sections (601A, 601B, 602-607)
├── timetable.js       # Complete Section 601A schedule
├── students.js        # Students for 601A, 601B, 602
└── firebaseExport.json # Firebase-ready export
```

## Quick Import Examples

### Get Current Lecture
```javascript
import { detectCurrentLecture } from '../utils/lectureDetector';

const lecture = detectCurrentLecture('601A');
// Returns: { subject, teacher, room, type, time, day, slot, section }
```

### Get Teacher's Lectures
```javascript
import { getLecturesByTeacher } from '../data/timetable';

const lectures = getLecturesByTeacher('Juned');
// Returns: Array of Full Stack lectures
```

### Get Students by Section
```javascript
import { getStudentsBySection } from '../data/students';

const students = getStudentsBySection('601A');
// Returns: Array of 10 students
```

### Get Current Time Slot
```javascript
import { getCurrentTimeSlot } from '../data/timeSlots';

const slot = getCurrentTimeSlot();
// Returns: { id: 2, start: '10:20', end: '11:10', label: '10:20 - 11:10' }
```

## Real Data Examples

### Monday Schedule (Section 601A)
| Time | Subject | Teacher | Room | Type |
|------|---------|---------|------|------|
| 09:30 - 10:20 | Full Stack | Juned | 208 | Lecture |
| 10:20 - 11:10 | Competitive Coding | Shivam | 208 | Lecture |
| 11:20 - 12:10 | Software Engineering | Dr. Siddharth Arora | 208 | Lecture |
| 01:55 - 02:45 | Soft Skills | Komal Dhiman | 208 | Lecture |

### Teachers List
1. Juned - Full Stack
2. Shivam - Competitive Coding
3. Komal Dhiman - Soft Skills
4. Dr. Siddharth Arora - Software Engineering
5. Shabnam - Operating Systems
6. Shaqlain - DAA
7. Subham K Mishra - Java
8. Ashish Agrawal - Aptitude
9. Neeraj - Intro to ML

### Subjects List
1. Full Stack (FS) - 4 credits
2. Competitive Coding (CC) - 2 credits
3. Software Engineering (SE) - 4 credits
4. Operating Systems (OS) - 4 credits
5. DAA (DAA) - 4 credits
6. Java (JAVA) - 4 credits
7. Soft Skills (SS) - 2 credits
8. Aptitude (APT) - 2 credits
9. Intro to ML (ML) - 3 credits
10. DAA Lab (DAA-LAB) - 2 credits
11. Java Lab (JAVA-LAB) - 2 credits

### Sections
- 24BCS_KRG_601A (10 students)
- 24BCS_KRG_601B (5 students)
- 24BCS_TPP_602 (3 students)
- 24BCS_TPP_603-607 (to be added)

## Helper Functions Cheat Sheet

### Timetable Functions
```javascript
import { 
  getCurrentLecture,      // (section, day, timeSlot) → lecture
  getLecturesByDay,       // (section, day) → lectures[]
  getLecturesByTeacher,   // (teacherName) → lectures[]
  getLecturesBySubject,   // (subjectName) → lectures[]
  getTimetableForFirebase // (section) → firebaseData[]
} from '../data/timetable';
```

### Student Functions
```javascript
import { 
  getStudentsBySection,              // (section) → students[]
  getStudentByUID,                   // (uid) → student
  getStudentById,                    // (id) → student
  getStudentsWithoutFaceRegistration // () → students[]
} from '../data/students';
```

### Time Slot Functions
```javascript
import { 
  getTimeSlotByTime,  // (currentTime) → slot
  getCurrentTimeSlot  // () → slot
} from '../data/timeSlots';
```

### Subject Functions
```javascript
import { 
  getSubjectByName,    // (name) → subject
  getSubjectByCode,    // (code) → subject
  getLabSubjects,      // () → subjects[]
  getTheorySubjects    // () → subjects[]
} from '../data/subjects';
```

### Teacher Functions
```javascript
import { 
  getTeacherByName,      // (name) → teacher
  getTeachersBySubject   // (subject) → teachers[]
} from '../data/teachers';
```

### Lecture Detector Functions
```javascript
import { 
  detectCurrentLecture,  // (section) → lecture | null
  isInLecturePeriod,     // (section) → boolean
  getNextLecture         // (section) → lecture | null
} from '../utils/lectureDetector';
```

## Testing Commands

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## Common Use Cases

### 1. Show Current Lecture on Dashboard
```javascript
const lecture = detectCurrentLecture('601A');
if (lecture) {
  console.log(`Current: ${lecture.subject} - ${lecture.teacher}`);
}
```

### 2. Filter Students by Section
```javascript
const [section, setSection] = useState('601A');
const students = getStudentsBySection(section);
```

### 3. Show Faculty Schedule
```javascript
const facultyName = 'Juned';
const schedule = getLecturesByTeacher(facultyName);
```

### 4. Check if Lecture is Happening Now
```javascript
if (isInLecturePeriod('601A')) {
  // Show "Join Session" button
}
```

### 5. Get All Lab Subjects
```javascript
const labs = getLabSubjects();
// Returns: DAA Lab, Java Lab
```

## Page-Specific Data Usage

### Timetable Page
```javascript
// Admin: Show all lectures for selected day
const lectures = getLecturesByDay('601A', selectedDay);

// Faculty: Show only their lectures
const lectures = getLecturesByTeacher(user.name);
```

### Students Page
```javascript
// Show all students
const students = ALL_STUDENTS;

// Filter by section
const filtered = getStudentsBySection(selectedSection);
```

### Subjects Page
```javascript
// Admin: Show all subjects
const subjects = SUBJECTS;

// Faculty: Show only assigned subjects
const myLectures = getLecturesByTeacher(user.name);
const mySubjects = [...new Set(myLectures.map(l => l.subject))];
```

### Attendance Page
```javascript
// Get faculty subjects
const mySubjects = getLecturesByTeacher(user.name)
  .map(l => l.subject)
  .filter((s, i, arr) => arr.indexOf(s) === i);
```

### Live Session Page
```javascript
// Auto-detect current lecture
const lecture = detectCurrentLecture('601A');
```

## Firebase Structure Preview

```json
{
  "teachers": {
    "T001": { "name": "Juned", "subject": "Full Stack" }
  },
  "subjects": {
    "SUB001": { "code": "FS", "name": "Full Stack", "credits": 4 }
  },
  "timetable": {
    "601A_Monday_1": {
      "section": "24BCS_KRG_601A",
      "day": "Monday",
      "slot": 1,
      "subject": "Full Stack",
      "teacher": "Juned",
      "room": "208"
    }
  },
  "students": {
    "STU001": {
      "uid": "24BCS10001",
      "name": "Aarav Sharma",
      "section": "601A"
    }
  }
}
```

## Troubleshooting

### Issue: No lecture detected
**Solution**: Check if current time is within lecture hours (9:30 AM - 4:25 PM) and day is Monday-Friday

### Issue: Faculty sees all subjects
**Solution**: Verify `getLecturesByTeacher()` is being used with correct teacher name

### Issue: Section filter not working
**Solution**: Ensure section format matches data (e.g., '601A' not 'A')

### Issue: Build errors
**Solution**: Run `npm install` and check for missing dependencies

## Documentation Files
- `README.md` - Project overview
- `QUICKSTART.md` - Getting started
- `CU_DATA_INTEGRATION.md` - Detailed data documentation
- `IMPLEMENTATION_SUMMARY.md` - What was implemented
- `TESTING_GUIDE.md` - How to test
- `ROLE_BASED_FEATURES.md` - Role-specific features
- `COLLEGE_FACULTY_FEATURES.md` - Faculty-specific features

---

**Quick Tip**: Use `Ctrl+P` in VS Code and type the file name to quickly open any data file!
