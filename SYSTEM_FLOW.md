# 🔄 AttendAI System Flow

## Faculty Flow

```
1. Login → 2. Dashboard → 3. Attendance Page → 4. Start Live Session
   ↓
5. QR Code Displays (refreshes every 5s) → 6. Monitor Real-Time Updates
   ↓
7. End Session → 8. Attendance Saved
```

## Student Flow

```
1. Visit /scan → 2. Enter UID → 3. Start Camera → 4. Scan QR Code
   ↓
5. Validation → 6. Mark Attendance → 7. Success Message
```

## System Architecture

```
Frontend (React)
├── Pages (Landing, Login, Dashboard, etc.)
├── Components (UI, Layout, Dashboard)
├── Services (Auth, QR, Attendance)
├── Context (Auth State)
└── Data (Users, Timetable, Students)

Deployment
├── Vercel (Hosting)
├── GitHub (Version Control)
└── HTTPS (Security)
```

## Data Flow

```
Faculty Action → Generate QR → Display on Screen
                                      ↓
Student Scans → Validate Token → Check Session → Mark Attendance
                                                        ↓
Real-Time Update → Faculty Screen Updates → Counter Increases
```

## Security Flow

```
QR Generation → Add Timestamp → Encrypt Data → Display (5s lifetime)
                                                      ↓
Student Scan → Decrypt → Validate Time → Check Duplicate → Allow/Deny
```

---

**Last Updated**: March 11, 2026
