# AttendAI - Role-Based Features Summary

## 🎭 Complete Role & Institution Matrix

### The 4 User Types

```
                    SCHOOL                      COLLEGE/UNIVERSITY
                    ------                      ------------------
ADMIN       School Principal              University Administrator
            (Full Control)                (Full Control)

FACULTY     School Teacher                College Professor
            (Limited Access)              (Limited Access)
```

---

## 📊 Feature Comparison Table

| Feature | School Admin | School Faculty | College Admin | College Faculty |
|---------|--------------|----------------|---------------|-----------------|
| **Dashboard Title** | School Principal Dashboard | Teacher Dashboard | University Admin Dashboard | Professor Dashboard |
| **Add Students** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Edit Students** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Add Subjects** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Edit Subjects** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Edit Timetable** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Take Attendance** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **View Reports** | ✅ All | ✅ Own Classes | ✅ All | ✅ Own Lectures |
| **Default Attendance Mode** | Face Recognition | Face Recognition | QR Code | QR Code |

---

## 🏫 School vs College Differences

### Student Management

**School:**
- Roll Format: `X-A-15`, `IX-A-20`
- Extra Column: Grade (Class 9, Class 10)
- Names: School-appropriate
- Focus: Class-based

**College:**
- Roll Format: `CS-24-001`, `CS-24-002`
- Extra Column: Year (1st Year, 2nd Year)
- Names: College-appropriate
- Focus: Course-based

### Subject Management

**School:**
- Subjects: Math, Science, English, Social Studies, Hindi
- Codes: `MATH-X`, `SCI-X`, `ENG-X`
- Teachers: Mrs. Sharma, Mr. Patel
- Metric: Periods per Week (4-6)

**College:**
- Subjects: CS101, Data Structures, Calculus, Physics
- Codes: `CS101`, `MTH101`, `PHY101`
- Instructors: Dr. Turing, Prof. Hopper
- Metric: Credits (3-4)

### Timetable

**School:**
- Duration: 45 minutes per period
- Labels: Period 1, Period 2, Period 3
- Start: 8:00 AM
- Rooms: Room 10-A, Lab 1
- Schedule: 5-6 periods per day

**College:**
- Duration: 1.5-2 hours per lecture
- Labels: Lecture, Lab
- Start: 9:00 AM
- Rooms: Lecture Hall 1, Lab 3
- Schedule: 3-4 lectures per day

### Attendance

**School:**
- Default: Face Recognition (Group Scan)
- Duration: 45 min (1 period), 90 min (2 periods)
- Description: "Zero student devices needed"
- Use Case: Fixed classroom, same students

**College:**
- Default: QR Code + Face Verification
- Duration: 1 hour, 1.5 hours, 2 hours
- Description: "Scales to large lecture halls"
- Use Case: Large halls, varying students

### Reports

**School:**
- Focus: Daily attendance
- Reports: Daily Overview, Absentee List, Parent Notifications
- Metrics: School-wide or class-specific
- Frequency: Daily

**College:**
- Focus: Monthly/Semester attendance
- Reports: Monthly Overview, Defaulters List, Semester Summary
- Metrics: Campus-wide or lecture-specific
- Frequency: Monthly/Semester

---

## 🔐 Permission Matrix

### What Admins Can Do (Both School & College)

✅ Add new students
✅ Edit student information
✅ Delete students
✅ Add new subjects
✅ Edit subject details
✅ Manage subject assignments
✅ Create timetable slots
✅ Edit timetable
✅ Delete timetable entries
✅ Take attendance
✅ View all reports
✅ Export data
✅ Manage system settings
✅ View campus/school-wide statistics

### What Faculty Can Do (Both School & College)

✅ View assigned students (read-only)
✅ View assigned subjects (read-only)
✅ View personal timetable (read-only)
✅ Take attendance for their classes
✅ View their own reports
✅ Export their own data
❌ Cannot add/edit students
❌ Cannot add/edit subjects
❌ Cannot modify timetable
❌ Cannot view other teachers' data
❌ Cannot access system settings

---

## 📱 UI Adaptations

### Buttons That Appear/Disappear

**Admin Only:**
- "Add Student" button (Students page)
- "Add Subject" button (Subjects page)
- "Add Slot" button (Timetable page)
- "Edit" buttons in tables
- "Manage" buttons
- "System Settings" in quick actions

**Faculty:**
- No add/edit buttons
- Read-only tables
- Personal data only
- Limited quick actions

### Content That Changes

**Dashboard Stats:**
- Admin: Campus/School-wide numbers
- Faculty: Personal class/lecture numbers

**Page Titles:**
- Admin: "Student Directory", "Subject Management"
- Faculty: "My Students", "My Subjects"

**Page Descriptions:**
- Admin: "Manage all enrollments..."
- Faculty: "View students enrolled in your sections..."

---

## 🎨 Visual Indicators

### Role Badges (Sidebar)

**Administrator:**
- Icon: UserCog (gear icon)
- Text: "Administrator"
- Subtext: "School Portal" or "College Portal"

**Faculty:**
- Icon: GraduationCap
- Text: "Faculty"
- Subtext: "School Portal" or "College Portal"

### Color Coding

- Primary Actions: Blue (#1E3A8A)
- Success States: Green (#10B981)
- Warning States: Yellow
- Neutral States: Gray

---

## 🔄 State Management

### User Context Stored

```javascript
{
  instType: 'school' | 'college',
  role: 'admin' | 'faculty'
}
```

### How It's Used

1. **Dashboard**: Determines which config to load
2. **Students**: Filters data and controls
3. **Subjects**: Shows appropriate subjects
4. **Timetable**: Adjusts time slots
5. **Attendance**: Sets default mode
6. **Reports**: Filters report types
7. **Sidebar**: Shows role badge

---

## 🧪 Testing Each Combination

### 1. School Admin
```
Login → School + Administrator
Expected: Full control, school data, periods-based
```

### 2. School Faculty
```
Login → School + Faculty
Expected: Read-only, class data, periods-based
```

### 3. College Admin
```
Login → College + Administrator
Expected: Full control, college data, credits-based
```

### 4. College Faculty
```
Login → College + Faculty
Expected: Read-only, lecture data, credits-based
```

---

## 📈 Statistics Variations

### School Admin Dashboard
- Total Enrolled: 1,200
- School Attendance: 95.8%
- Active Classes: 40
- Total Absentees: 45

### School Faculty Dashboard
- Class Strength: 45
- Today's Attendance: 98.2%
- Periods Today: 6
- Pending Approvals: 2

### College Admin Dashboard
- Campus Students: 12,405
- Campus Attendance: 88.4%
- Active Lectures: 145
- Proxy Alerts: 12

### College Faculty Dashboard
- My Students: 350
- Avg Attendance: 92.1%
- Lectures Today: 3
- Low Attendance: 15

---

## ✅ Implementation Checklist

- [x] Dashboard adapts to 4 combinations
- [x] Students page shows correct data
- [x] Subjects page shows correct format
- [x] Timetable shows correct schedule
- [x] Attendance defaults to correct mode
- [x] Reports show relevant data
- [x] Admin controls only for admins
- [x] Faculty has read-only access
- [x] Sidebar shows correct role badge
- [x] All pages maintain user context

---

## 🚀 Ready to Test!

Run the app and try all 4 combinations:
1. School + Admin
2. School + Faculty
3. College + Admin
4. College + Faculty

Each should show completely different content! 🎉
