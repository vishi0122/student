# Chandigarh University Data Integration

## Overview
This document describes the integration of real Chandigarh University CSE 2nd Year timetable data into the AttendAI system.

## Data Structure

### 1. Time Slots (`src/data/timeSlots.js`)
8 lecture slots from 9:30 AM to 4:25 PM (50-minute lectures each):
- Slot 1: 09:30 - 10:20
- Slot 2: 10:20 - 11:10
- Slot 3: 11:20 - 12:10
- Slot 4: 12:10 - 01:00
- Slot 5: 01:05 - 01:55
- Slot 6: 01:55 - 02:45
- Slot 7: 02:45 - 03:35
- Slot 8: 03:35 - 04:25

**Helper Functions:**
- `getTimeSlotByTime(currentTime)` - Get slot by time string
- `getCurrentTimeSlot()` - Get current slot based on system time

### 2. Teachers (`src/data/teachers.js`)
9 teachers with their assigned subjects:
- Juned - Full Stack
- Shivam - Competitive Coding
- Komal Dhiman - Soft Skills
- Dr. Siddharth Arora - Software Engineering
- Shabnam - Operating Systems
- Shaqlain - DAA
- Subham K Mishra - Java
- Ashish Agrawal - Aptitude
- Neeraj - Intro to ML

### 3. Subjects (`src/data/subjects.js`)
11 subjects with codes, credits, and types:
- Full Stack (FS) - 4 credits, Theory
- Competitive Coding (CC) - 2 credits, Theory
- Software Engineering (SE) - 4 credits, Theory
- Operating Systems (OS) - 4 credits, Theory
- Design and Analysis of Algorithms (DAA) - 4 credits, Theory
- Java (JAVA) - 4 credits, Theory
- Soft Skills (SS) - 2 credits, Theory
- Aptitude (APT) - 2 credits, Theory
- Intro to Machine Learning (ML) - 3 credits, Theory
- DAA Lab (DAA-LAB) - 2 credits, Lab
- Java Lab (JAVA-LAB) - 2 credits, Lab

### 4. Sections (`src/data/sections.js`)
8 sections:
- 24BCS_KRG_601A
- 24BCS_KRG_601B
- 24BCS_TPP_602
- 24BCS_TPP_603
- 24BCS_TPP_604
- 24BCS_TPP_605
- 24BCS_TPP_606
- 24BCS_TPP_607

### 5. Timetable (`src/data/timetable.js`)
Complete Monday-Friday schedule for Section 601A with:
- Subject name
- Teacher name
- Room number
- Lecture type (Lecture/Lab/Break)
- Time slot

**Helper Functions:**
- `getCurrentLecture(section, day, timeSlot)` - Get lecture for specific time
- `getLecturesByDay(section, day)` - Get all lectures for a day
- `getLecturesByTeacher(teacherName)` - Get all lectures for a teacher
- `getLecturesBySubject(subjectName)` - Get all lectures for a subject
- `getTimetableForFirebase(section)` - Export in Firebase format

### 6. Students (`src/data/students.js`)
Sample student data for sections 601A, 601B, and 602:
- Student ID
- UID (University ID)
- Name
- Section
- Year
- Email
- Face registration status

**Helper Functions:**
- `getStudentsBySection(section)` - Filter students by section
- `getStudentByUID(uid)` - Find student by UID
- `getStudentById(id)` - Find student by ID
- `getStudentsWithoutFaceRegistration()` - Get unregistered students

## Automatic Lecture Detection

### Lecture Detector Utility (`src/utils/lectureDetector.js`)
Automatically detects current lecture based on:
- Current system time
- Current day of week
- Section

**Functions:**
- `detectCurrentLecture(section)` - Returns current lecture info or null
- `isInLecturePeriod(section)` - Check if currently in a lecture
- `getNextLecture(section)` - Get next lecture info (coming soon)

**Returns:**
```javascript
{
  subject: 'Full Stack',
  teacher: 'Juned',
  room: '208',
  type: 'Lecture',
  time: '09:30 - 10:20',
  day: 'Monday',
  slot: 1,
  section: '24BCS_KRG_601A'
}
```

## Page Integration

### 1. Timetable Page (`src/pages/Timetable.jsx`)
- **College Admin**: Shows complete Section 601A timetable with day selector
- **College Faculty**: Shows only their assigned lectures (e.g., Juned sees only Full Stack lectures)
- **School**: Shows school schedule

**Features:**
- Day-by-day navigation (Monday-Friday)
- Real-time data from `TIMETABLE_601A`
- Teacher-specific filtering for faculty
- Displays: Time, Subject, Section, Room, Instructor, Type (Lecture/Lab)

### 2. Students Page (`src/pages/Students.jsx`)
- **College Admin**: Shows all students from all sections
- **College Faculty**: Shows all students with section filter (601A, 601B, 602)
- **School**: Shows school students

**Features:**
- Real student data from `ALL_STUDENTS`
- Section filter dropdown for faculty
- Face registration status
- Student UID display

### 3. Subjects Page (`src/pages/Subjects.jsx`)
- **College Admin**: Shows all 11 subjects with assigned teachers
- **College Faculty**: Shows only assigned subjects (e.g., Juned sees only Full Stack)
- **School**: Shows school subjects

**Features:**
- Real subject data from `SUBJECTS`
- Teacher mapping from `TEACHERS`
- Credits and type (Theory/Lab) display
- Faculty-specific filtering using `getLecturesByTeacher()`

### 4. Attendance Page (`src/pages/Attendance.jsx`)
- **College Admin**: All subjects available, both modes
- **College Faculty**: Only assigned subjects, University Mode only, Lecture/Lab selector
- **School**: School subjects, School Mode

**Features:**
- Real subject list from `SUBJECTS`
- Faculty subjects from `getLecturesByTeacher()`
- Section selector (601A, 601B, 602)
- Session type: Lecture (50 min) or Lab (100 min)

### 5. Live Session Page (`src/pages/LiveSession.jsx`)
- Automatically detects and displays current lecture info
- Shows: Subject, Teacher, Room, Time, Type
- Real-time attendance counter
- QR code or camera view based on mode

**Features:**
- Uses `detectCurrentLecture()` for automatic detection
- Displays current lecture context
- Session duration based on type (50 min / 100 min)

## Firebase Export

### Firebase-Ready JSON (`src/data/firebaseExport.json`)
Complete database structure ready for Firebase import:
- Teachers collection
- Subjects collection
- Sections collection
- Time slots collection
- Timetable collection (Section 601A)
- Students collection

**Usage:**
1. Open Firebase Console
2. Go to Firestore Database
3. Import JSON file
4. Data structure will be created automatically

## How It Works

### Automatic Lecture Detection Flow
```
1. User opens Live Session page
2. System reads current time (e.g., 10:30 AM)
3. System reads current day (e.g., Wednesday)
4. getCurrentTimeSlot() → Returns Slot 2 (10:20-11:10)
5. getCurrentLecture('601A', 'Wednesday', 2) → Returns:
   {
     subject: 'Operating Systems',
     teacher: 'Shabnam',
     room: '208',
     type: 'Lecture'
   }
6. Display lecture info on screen
7. Start attendance session with correct context
```

### Faculty Experience Flow
```
1. Faculty logs in (e.g., Juned)
2. System identifies user as College Faculty
3. Subjects page: getLecturesByTeacher('Juned') → Shows only Full Stack
4. Timetable page: Shows only Juned's lectures (Monday & Friday)
5. Attendance page: Subject dropdown shows only Full Stack
6. Students page: Shows all students with section filter
```

## Testing

### Test Current Lecture Detection
```javascript
import { detectCurrentLecture } from './utils/lectureDetector';

// Test at different times
const lecture = detectCurrentLecture('601A');
console.log(lecture);
// Should return current lecture or null if no lecture
```

### Test Faculty Subjects
```javascript
import { getLecturesByTeacher } from './data/timetable';

const junedLectures = getLecturesByTeacher('Juned');
console.log(junedLectures);
// Should return Full Stack lectures on Monday and Friday
```

## Next Steps

1. **Connect to Firebase**: Replace mock data with real Firebase queries
2. **Add More Sections**: Extend timetable data for 601B, 602-607
3. **Enhance Detection**: Add next lecture prediction
4. **Add Notifications**: Alert faculty before lecture starts
5. **Attendance Analytics**: Track attendance patterns per subject/teacher
6. **Student Dashboard**: Show personalized timetable for students

## Notes

- All times are in 12-hour format with AM/PM
- Section format: 24BCS_KRG_601A (Year_Campus_Section)
- Lab sessions are 50 minutes (can be extended to 100 for double periods)
- Break periods are marked but not displayed in UI
- Faculty example uses "Juned" - can be changed to any teacher name
