# Login Testing Guide

## Quick Test Credentials

### 🎓 College Faculty (Recommended for Testing)
```
Email: juned@cumail.in
Password: Juned@FS2024
```
**What you'll see:**
- Dashboard with personal stats
- Subjects: Only "Full Stack"
- Timetable: Monday & Friday lectures only
- Students: All students with section filter
- Attendance: University Mode (QR) only with Lecture/Lab selector

---

### 👨‍💼 College Admin
```
Email: admin.college@cumail.in
Password: CU@Admin2024
```
**What you'll see:**
- Dashboard with system-wide stats
- Subjects: All 11 subjects
- Timetable: Complete Section 601A schedule
- Students: All students from all sections
- Attendance: Both modes available

---

### 🏫 School Faculty
```
Email: sharma.math@dps.edu
Password: Sharma@Math2024
```
**What you'll see:**
- Dashboard with class stats
- Subjects: Mathematics only
- Timetable: Class 10-A schedule
- Students: Assigned students only
- Attendance: Face Recognition mode

---

### 🏢 School Admin
```
Email: admin.school@dps.edu
Password: School@2024
```
**What you'll see:**
- Dashboard with school-wide stats
- Subjects: All school subjects
- Timetable: Complete school schedule
- Students: All school students
- Attendance: Face Recognition mode

---

## All Faculty Credentials

### Chandigarh University Faculty

| Name | Email | Password | Subject |
|------|-------|----------|---------|
| Juned | juned@cumail.in | Juned@FS2024 | Full Stack |
| Shivam | shivam@cumail.in | Shivam@CC2024 | Competitive Coding |
| Komal Dhiman | komal.dhiman@cumail.in | Komal@SS2024 | Soft Skills |
| Dr. Siddharth Arora | siddharth.arora@cumail.in | Siddharth@SE2024 | Software Engineering |
| Shabnam | shabnam@cumail.in | Shabnam@OS2024 | Operating Systems |
| Shaqlain | shaqlain@cumail.in | Shaqlain@DAA2024 | DAA |
| Subham K Mishra | subham.mishra@cumail.in | Subham@Java2024 | Java |
| Ashish Agrawal | ashish.agrawal@cumail.in | Ashish@APT2024 | Aptitude |
| Neeraj | neeraj@cumail.in | Neeraj@ML2024 | Intro to ML |

### School Faculty

| Name | Email | Password | Subject |
|------|-------|----------|---------|
| Mrs. Sharma | sharma.math@dps.edu | Sharma@Math2024 | Mathematics |
| Mr. Patel | patel.science@dps.edu | Patel@Sci2024 | Science |
| Ms. Reddy | reddy.english@dps.edu | Reddy@Eng2024 | English |
| Mr. Kumar | kumar.social@dps.edu | Kumar@SS2024 | Social Studies |
| Mrs. Gupta | gupta.hindi@dps.edu | Gupta@Hindi2024 | Hindi |

---

## Testing Workflow

### 1. Test College Faculty Experience
```bash
# Start the app
npm run dev

# Login with Juned's credentials
Email: juned@cumail.in
Password: Juned@FS2024

# Navigate through pages
1. Dashboard → Check personal stats
2. Subjects → Should show only "Full Stack"
3. Timetable → Should show Monday & Friday only
4. Students → Should show all students with section filter
5. Attendance → Should show University Mode only
6. Start Live Session → Should auto-detect current lecture
```

### 2. Test College Admin Experience
```bash
# Logout and login with admin credentials
Email: admin.college@cumail.in
Password: CU@Admin2024

# Navigate through pages
1. Dashboard → Check system-wide stats
2. Subjects → Should show all 11 subjects
3. Timetable → Should show complete 601A schedule
4. Students → Should show all students
5. Attendance → Should show both modes
```

### 3. Test Different Faculty Members
Try logging in as different faculty to see their specific subjects:
- Shabnam → Operating Systems (appears on Tue, Wed, Thu)
- Shaqlain → DAA + DAA Lab (appears on Tue, Wed, Thu)
- Subham K Mishra → Java + Java Lab (appears on Wed, Thu, Fri)

---

## Expected Behavior

### College Faculty Login
✅ Should see University Mode only  
✅ Should see Lecture/Lab selector (50 min / 100 min)  
✅ Should see only assigned subjects  
✅ Should see only personal timetable  
✅ Should see all students with section filter  
✅ Should see lecture-specific reports  

### College Admin Login
✅ Should see both modes (Face + QR)  
✅ Should see all subjects  
✅ Should see complete timetable  
✅ Should see all students  
✅ Should see system-wide reports  

### School Faculty Login
✅ Should see Face Recognition mode only  
✅ Should see assigned subjects  
✅ Should see assigned classes  
✅ Should see assigned students  
✅ Should see class reports  

### School Admin Login
✅ Should see Face Recognition mode only  
✅ Should see all subjects  
✅ Should see all classes  
✅ Should see all students  
✅ Should see school-wide reports  

---

## Troubleshooting

### Issue: Login fails
**Solution**: Check that you're using the exact email and password from the table above. Passwords are case-sensitive.

### Issue: Wrong role displayed
**Solution**: Clear browser localStorage and try again:
```javascript
// Open browser console and run:
localStorage.clear();
// Then refresh and login again
```

### Issue: Faculty sees all subjects
**Solution**: Verify you're logged in as faculty (not admin). Check the header for user name.

### Issue: Can't see section filter
**Solution**: Section filter only appears for College Faculty. School faculty don't have sections.

---

## Testing Checklist

### College Faculty (Juned)
- [ ] Login successful
- [ ] Dashboard shows personal stats
- [ ] Subjects page shows only "Full Stack"
- [ ] Timetable shows Monday & Friday only
- [ ] Students page shows all students
- [ ] Section filter works (601A, 601B, 602)
- [ ] Attendance shows University Mode only
- [ ] Lecture/Lab selector visible
- [ ] Live Session auto-detects lecture

### College Admin
- [ ] Login successful
- [ ] Dashboard shows system stats
- [ ] Subjects page shows all 11 subjects
- [ ] Timetable shows complete schedule
- [ ] Day selector works (Mon-Fri)
- [ ] Students page shows all students
- [ ] Attendance shows both modes
- [ ] Can switch between modes

### School Faculty
- [ ] Login successful
- [ ] Dashboard shows class stats
- [ ] Subjects page shows assigned subject
- [ ] Timetable shows class schedule
- [ ] Students page shows assigned students
- [ ] Attendance shows Face Recognition only
- [ ] Period selector visible

### School Admin
- [ ] Login successful
- [ ] Dashboard shows school stats
- [ ] Subjects page shows all subjects
- [ ] Timetable shows all classes
- [ ] Students page shows all students
- [ ] Attendance shows Face Recognition only
- [ ] Can manage all data

---

## Demo Scenarios

### Scenario 1: Faculty Taking Attendance
1. Login as Juned (juned@cumail.in / Juned@FS2024)
2. Go to "Take Attendance"
3. Select "Full Stack" from subject dropdown
4. Select "Section 601A"
5. Choose "Lecture (50 min)"
6. Click "Start Lecture Session"
7. QR code should appear
8. Students scan and mark attendance

### Scenario 2: Admin Viewing Reports
1. Login as College Admin (admin.college@cumail.in / CU@Admin2024)
2. Go to "Reports"
3. View system-wide attendance statistics
4. Filter by subject, section, date range
5. Export reports

### Scenario 3: Faculty Checking Timetable
1. Login as Shabnam (shabnam@cumail.in / Shabnam@OS2024)
2. Go to "Timetable"
3. Should see Operating Systems lectures on:
   - Tuesday 10:20-11:10
   - Wednesday 10:20-11:10
   - Thursday 10:20-11:10
4. All in Room 208

---

## Password Format
All passwords follow the pattern: `Name@Subject/Role2024`

Examples:
- Juned → `Juned@FS2024` (FS = Full Stack)
- Shabnam → `Shabnam@OS2024` (OS = Operating Systems)
- Admin → `CU@Admin2024` (CU = Chandigarh University)

---

## Security Notes

⚠️ **Development Only**: These credentials are for development and testing only.

🔒 **Production**: In production:
- Change all passwords
- Use Firebase Authentication
- Enable two-factor authentication
- Implement password hashing
- Set up session management
- Enable audit logging

---

## Quick Commands

### Clear Login Session
```javascript
// In browser console
localStorage.removeItem('attendai_user');
```

### Check Current User
```javascript
// In browser console
JSON.parse(localStorage.getItem('attendai_user'));
```

### Force Logout
```javascript
// In browser console
localStorage.clear();
location.reload();
```

---

**Last Updated**: March 11, 2026  
**For**: Development & Testing  
**Status**: Active
