# AttendAI - Complete Testing Guide

This guide helps you test all 4 role/institution combinations to see how the UI adapts.

## 🎭 Four User Personas

### 1. School Administrator
**Login Configuration:**
- Institution Type: School
- Role: Administrator

**What You'll See:**
- Dashboard: School Principal Dashboard
- Students: School students (Class 9, Class 10) with grade column
- Subjects: School subjects (Math, Science, English) with periods/week
- Timetable: Period-based schedule (45-minute slots)
- Attendance: School mode (Face Recognition) as default
- Reports: School-wide daily reports

**Key Features:**
- Full admin controls (Add/Edit buttons)
- School-wide statistics
- Period-based scheduling
- Parent notification options

---

### 2. School Faculty (Teacher)
**Login Configuration:**
- Institution Type: School
- Role: Faculty

**What You'll See:**
- Dashboard: Teacher Dashboard
- Students: Class students (read-only, no Add button)
- Subjects: Assigned subjects only (read-only)
- Timetable: Personal class schedule
- Attendance: School mode (Face Recognition)
- Reports: Class-specific reports

**Key Features:**
- Limited to assigned class
- No admin controls
- Focus on daily periods
- Class strength metrics

---

### 3. College Administrator
**Login Configuration:**
- Institution Type: College/University
- Role: Administrator

**What You'll See:**
- Dashboard: University Admin Dashboard
- Students: College students (CS-24-001 format) with year column
- Subjects: College courses with credits system
- Timetable: Lecture hall schedule (1.5-2 hour slots)
- Attendance: University mode (QR Code) as default
- Reports: Campus-wide monthly reports

**Key Features:**
- Full admin controls
- Campus-wide statistics
- Credit-based system
- Lecture hall management
- Proxy alert monitoring

---

### 4. College Faculty (Professor)
**Login Configuration:**
- Institution Type: College/University
- Role: Faculty

**What You'll See:**
- Dashboard: Professor Dashboard
- Students: Enrolled students across courses (read-only)
- Subjects: Teaching assignments (read-only)
- Timetable: Personal lecture schedule
- Attendance: University mode (QR Code)
- Reports: Lecture-specific analytics

**Key Features:**
- Multiple course management
- QR code generation
- Lecture-based scheduling
- Student enrollment tracking

---

## 📊 Page-by-Page Differences

### Dashboard Page

| Feature | School Admin | School Faculty | College Admin | College Faculty |
|---------|--------------|----------------|---------------|-----------------|
| Title | School Principal Dashboard | Teacher Dashboard | University Admin Dashboard | Professor Dashboard |
| Student Count | Total Enrolled: 1,200 | Class Strength: 45 | Campus Students: 12,405 | My Students: 350 |
| Attendance Metric | School Attendance: 95.8% | Today's Attendance: 98.2% | Campus Attendance: 88.4% | Avg Attendance: 92.1% |
| Active Metric | Active Classes: 40 | Periods Today: 6 | Active Lectures: 145 | Lectures Today: 3 |
| Alert Metric | Total Absentees: 45 | Pending Approvals: 2 | Proxy Alerts: 12 | Low Attendance: 15 |

### Students Page

| Feature | School | College |
|---------|--------|---------|
| Roll Format | X-A-15, IX-A-20 | CS-24-001, CS-24-002 |
| Extra Column | Grade (Class 9, Class 10) | Year (1st Year, 2nd Year) |
| Student Names | Indian school names | Indian college names |
| Admin Actions | Add/Edit/Scan | Add/Edit/Scan |
| Faculty View | Read-only | Read-only |

### Subjects Page

| Feature | School | College |
|---------|--------|---------|
| Subject Names | Math, Science, English | CS101, Data Structures |
| Code Format | MATH-X, SCI-X | CS101, MTH101 |
| Teacher Title | Teacher (Mrs. Sharma) | Instructor (Dr. Turing) |
| Extra Column | Periods/Week (4-6) | Credits (3-4) |
| Admin Actions | Manage | Manage |
| Faculty View | Read-only | Read-only |

### Timetable Page

| Feature | School | College |
|---------|--------|---------|
| Time Slots | 45 minutes | 1.5-2 hours |
| Slot Labels | Period 1, Period 2 | Lecture, Lab |
| Start Time | 8:00 AM | 9:00 AM |
| Room Format | Room 10-A | Lecture Hall 1, Lab 3 |
| Teacher Display | Mrs. Sharma | Dr. Turing |
| Admin Actions | Edit slots | Edit slots |
| Faculty View | Personal schedule | Personal schedule |

### Attendance Page

| Feature | School | College |
|---------|--------|---------|
| Default Mode | School (Face Recognition) | University (QR Code) |
| Subject Options | Math, Science, English | CS101, Data Structures |
| Duration Options | 45 min, 90 min | 1 hour, 1.5 hours, 2 hours |
| Mode Description | Group facial recognition | QR + mobile verification |

### Reports Page

| Feature | School Admin | School Faculty | College Admin | College Faculty |
|---------|--------------|----------------|---------------|-----------------|
| Main Report | School Daily Overview | My Class Overview | Campus Monthly Overview | My Lectures Overview |
| Report Types | Daily, Absentee, Parent Notification | Class-specific | Monthly, Defaulters, Semester | Lecture-specific |
| Avg Attendance | 95.8% | 98.2% | 89.4% | 94.2% |
| Classes Held | School-wide | My classes | Campus-wide | My lectures |

---

## 🧪 Testing Checklist

### Test Each Persona

For each of the 4 combinations, verify:

**Dashboard:**
- [ ] Correct title displays
- [ ] Statistics match role/institution
- [ ] Chart shows appropriate data
- [ ] Quick actions are relevant

**Students:**
- [ ] Correct student data (school vs college)
- [ ] Proper column headers (Grade vs Year)
- [ ] Admin sees Add button, Faculty doesn't
- [ ] Roll number format is correct

**Subjects:**
- [ ] Correct subject names
- [ ] Proper teacher/instructor title
- [ ] Credits vs Periods column
- [ ] Admin can manage, Faculty read-only

**Timetable:**
- [ ] Appropriate time slots
- [ ] Correct slot duration
- [ ] Proper room naming
- [ ] Teacher/instructor display

**Attendance:**
- [ ] Default mode matches institution
- [ ] Subject list is appropriate
- [ ] Duration options are correct
- [ ] Mode descriptions are clear

**Reports:**
- [ ] Report names match context
- [ ] Statistics are role-appropriate
- [ ] Report types are relevant

---

## 🎯 Quick Test Scenarios

### Scenario 1: School Teacher's Day
1. Login as School Faculty
2. Check Dashboard → See class strength (45 students)
3. Go to Students → See Class 10 students
4. Check Timetable → See 6 periods scheduled
5. Start Attendance → Use Face Recognition mode
6. View Reports → See class-specific data

### Scenario 2: College Professor's Lecture
1. Login as College Faculty
2. Check Dashboard → See 350 students across courses
3. Go to Subjects → See CS101, Data Structures
4. Check Timetable → See lecture hall schedule
5. Start Attendance → Generate QR code
6. View Reports → See lecture analytics

### Scenario 3: School Principal's Overview
1. Login as School Admin
2. Check Dashboard → See 1,200 total students
3. Go to Students → Add new student (button visible)
4. Manage Subjects → Edit periods/week
5. View Timetable → See all classes
6. Check Reports → School-wide statistics

### Scenario 4: University Admin's Management
1. Login as College Admin
2. Check Dashboard → See 12,405 campus students
3. Manage Students → Add/edit with year info
4. Configure Subjects → Set credits
5. View Timetable → Manage lecture halls
6. Monitor Reports → Campus-wide analytics

---

## 🔍 What to Look For

### Visual Differences
- **Color scheme**: Consistent across all roles
- **Icons**: Appropriate for context
- **Badges**: Status indicators work correctly
- **Tables**: Proper column headers

### Functional Differences
- **Admin buttons**: Only visible to administrators
- **Read-only views**: Faculty cannot edit
- **Data filtering**: Shows relevant data only
- **Navigation**: All pages accessible

### Content Differences
- **Terminology**: School vs College terms
- **Metrics**: Appropriate statistics
- **Time formats**: Periods vs Hours
- **Naming conventions**: Consistent within context

---

## 🐛 Common Issues to Check

1. **Role Confusion**: Ensure admin controls don't show for faculty
2. **Data Mismatch**: School data shouldn't show in college view
3. **Navigation**: All sidebar links should work
4. **Responsive Design**: Test on mobile view
5. **State Persistence**: User context maintained across pages

---

## ✅ Success Criteria

All tests pass when:
- ✅ Each persona sees appropriate content
- ✅ Admin controls only visible to admins
- ✅ School/College data doesn't mix
- ✅ All pages load without errors
- ✅ Navigation works smoothly
- ✅ Responsive design works on mobile
- ✅ User context persists across pages

---

## 📝 Testing Notes

**Current Implementation:**
- Mock authentication (any email/password works)
- Static data (no database yet)
- Simulated live sessions
- Role-based UI rendering
- Institution-specific content

**Future Enhancements:**
- Real Firebase authentication
- Dynamic data from database
- Actual face recognition
- Real QR code generation
- Live attendance tracking

---

## 🚀 Start Testing

1. Run the app: `npm run dev`
2. Open: `http://localhost:3000`
3. Click "Login"
4. Try each of the 4 combinations
5. Navigate through all pages
6. Verify content matches expectations

Happy testing! 🎉
