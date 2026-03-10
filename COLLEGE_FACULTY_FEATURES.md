# College Faculty - Specific Features

## 🎓 Overview

College Faculty members have a specialized experience tailored for university lecture management with QR-based attendance.

---

## 📋 Key Features for College Faculty

### 1. **Attendance Page** - University Mode Only

**What's Different:**
- ✅ Only shows University Mode (QR Code)
- ✅ No School Mode option visible
- ✅ Session Type selector: Lecture or Lab
- ✅ Only shows assigned subjects

**Session Types:**
```
Lecture:  50 minutes
Lab:      100 minutes (50+50)
```

**UI Changes:**
- Mode selection cards are hidden
- Session type selector appears instead
- Subject dropdown shows only assigned subjects (3 subjects)
- Button text changes based on session type

**Example Flow:**
1. Select Subject: "Computer Science 101"
2. Select Section: "Section A"
3. Choose Session Type: "Lecture (50 min)" or "Lab (100 min)"
4. Click "Start Lecture Session" or "Start Lab Session"

---

### 2. **Students Page** - All Students with Section Filter

**What's Different:**
- ✅ Shows ALL students (not just assigned)
- ✅ Section filter dropdown added
- ✅ Can filter by: All Sections, Section A, B, or C
- ❌ No "Add Student" button (read-only)
- ❌ No "Edit" or "Scan" buttons

**Student Data:**
- 8 students total across 3 sections
- Roll format: CS-24-001, CS-24-002, etc.
- Year column: 1st Year, 2nd Year, 3rd Year
- Face status: Registered or Pending

**Section Distribution:**
- Section A: 4 students
- Section B: 2 students
- Section C: 2 students

**UI Elements:**
```
[Search Box] [Section Filter ▼] [Filters Button]
```

---

### 3. **Subjects Page** - Only Assigned Subjects

**What's Different:**
- ✅ Shows only 3 assigned subjects
- ✅ Teacher column shows "You"
- ❌ No "Add Subject" button
- ❌ No "Manage" buttons (read-only)

**Assigned Subjects:**
1. Computer Science 101 (CS101) - Sections A, B - 4 Credits
2. Data Structures (CS201) - Section A - 4 Credits
3. Database Systems (CS301) - Section A - 3 Credits

**Total:** 11 credits across 3 subjects

---

### 4. **Timetable Page** - Personal Schedule Only

**What's Different:**
- ✅ Shows only your lectures/labs
- ✅ 50-minute lecture slots
- ✅ 100-minute lab slots
- ✅ Instructor shows "You"
- ❌ No "Add Slot" button
- ❌ No "Edit" buttons (read-only)

**Monday's Schedule:**
```
09:00 AM - 09:50 AM  | CS101 Lecture    | Sec A | Lecture Hall 1
10:00 AM - 10:50 AM  | CS101 Lecture    | Sec B | Lecture Hall 1
11:00 AM - 12:40 PM  | Data Structures  | Sec A | Lab 3 (Lab)
02:00 PM - 02:50 PM  | Database Systems | Sec A | Room 305
```

**Total:** 4 sessions per day

---

### 5. **Reports Page** - Lecture-Specific Reports

**What's Different:**
- ✅ Shows only your lecture reports
- ✅ 6 reports focused on your subjects
- ✅ Subject-specific attendance logs

**Available Reports:**
1. My Lectures Overview (System Auto-Gen)
2. CS101 - Section A Attendance
3. CS101 - Section B Attendance
4. Data Structures - Lab Attendance
5. Database Systems - Lecture Attendance
6. Low Attendance Students (My Classes)

**Statistics:**
- Average Attendance: 94.2%
- My Classes Held: 42
- Low Attendance Flags: 3 students

---

## 🎯 Complete User Journey

### Login as College Faculty

**Step 1: Login**
```
Institution Type: College/University
Role: Faculty
Email: faculty@college.edu
Password: password123
```

**Step 2: Dashboard**
- See: Professor Dashboard
- Stats: 350 students, 92.1% attendance, 3 lectures today
- Quick Actions: Generate QR, Fallback Scan, My Timetable

**Step 3: Take Attendance**
1. Click "Take Attendance" in sidebar
2. See only University Mode (no School Mode)
3. Choose Session Type: Lecture or Lab
4. Select Subject: CS101, Data Structures, or Database Systems
5. Select Section: A, B, or C
6. Click "Start Lecture Session" or "Start Lab Session"

**Step 4: View Students**
1. Click "Students" in sidebar
2. See all 8 students
3. Use section filter to view specific sections
4. No edit capabilities (read-only)

**Step 5: Check Subjects**
1. Click "Subjects" in sidebar
2. See only 3 assigned subjects
3. View credits and sections
4. No management options (read-only)

**Step 6: View Timetable**
1. Click "Timetable" in sidebar
2. See personal schedule with 4 sessions
3. 50-minute lectures, 100-minute labs
4. No edit capabilities (read-only)

**Step 7: Access Reports**
1. Click "Reports" in sidebar
2. See 6 lecture-specific reports
3. View attendance statistics
4. Export reports

---

## 🔄 Comparison: Admin vs Faculty

| Feature | College Admin | College Faculty |
|---------|---------------|-----------------|
| **Attendance Mode** | Can choose School or University | University only |
| **Session Types** | General duration options | Lecture (50 min) or Lab (100 min) |
| **Subjects** | All 5 campus subjects | Only 3 assigned subjects |
| **Students** | All students with edit | All students, read-only, with filter |
| **Timetable** | All campus schedules | Personal schedule only |
| **Reports** | Campus-wide (4 reports) | Lecture-specific (6 reports) |
| **Add/Edit Buttons** | ✅ Yes | ❌ No |

---

## 📊 Data Summary

### Students
- **Total Visible:** 8 students
- **Sections:** A (4), B (2), C (2)
- **Filter Options:** All, A, B, C

### Subjects
- **Total Assigned:** 3 subjects
- **Total Credits:** 11 credits
- **Sections Teaching:** A, B

### Timetable
- **Sessions per Day:** 4
- **Lecture Duration:** 50 minutes
- **Lab Duration:** 100 minutes
- **Total Teaching Hours:** ~4 hours/day

### Reports
- **Total Reports:** 6
- **Report Types:** Overview, Subject-specific, Low attendance
- **Focus:** Personal lectures only

---

## ✅ Testing Checklist

Test College Faculty features:

**Attendance:**
- [ ] Only University Mode visible
- [ ] Session type selector works (Lecture/Lab)
- [ ] Only 3 subjects in dropdown
- [ ] Button text changes with session type
- [ ] Can start lecture session
- [ ] Can start lab session

**Students:**
- [ ] All 8 students visible
- [ ] Section filter appears
- [ ] Can filter by section
- [ ] No Add/Edit buttons
- [ ] Year column shows correctly

**Subjects:**
- [ ] Only 3 subjects visible
- [ ] Teacher shows "You"
- [ ] Credits display correctly
- [ ] No Add/Manage buttons

**Timetable:**
- [ ] Only 4 personal sessions visible
- [ ] 50-minute lectures shown
- [ ] 100-minute labs shown
- [ ] Instructor shows "You"
- [ ] No Add/Edit buttons

**Reports:**
- [ ] 6 reports visible
- [ ] Subject-specific reports shown
- [ ] Statistics are personal
- [ ] No campus-wide reports

---

## 🎨 UI Highlights

### Attendance Page
```
┌─────────────────────────────────────┐
│ Initiate Attendance Session         │
│ Generate QR code for your lecture   │
├─────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐  │
│ │   Lecture    │ │     Lab      │  │
│ │  50 minutes  │ │ 100 minutes  │  │
│ └──────────────┘ └──────────────┘  │
├─────────────────────────────────────┤
│ Subject: [CS101 ▼]                  │
│ Section: [A ▼]                      │
│ Type: [Lecture (50 min) ▼]         │
│                                     │
│         [Start Lecture Session]     │
└─────────────────────────────────────┘
```

### Students Page
```
┌─────────────────────────────────────┐
│ My Students                         │
│ View students enrolled in sections  │
├─────────────────────────────────────┤
│ [Search...] [Section: All ▼] [⚙️]  │
├─────────────────────────────────────┤
│ Name      | Roll    | Sec | Year   │
│ Aarav     | CS-001  | A   | 2nd    │
│ Diya      | CS-002  | A   | 2nd    │
│ Rohan     | CS-003  | B   | 3rd    │
│ ...                                 │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

1. Login as College Faculty
2. Go to "Take Attendance"
3. Choose Lecture or Lab
4. Select your subject
5. Start QR session
6. Students scan and verify

That's it! 🎉
