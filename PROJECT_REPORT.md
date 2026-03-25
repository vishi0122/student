# AttendAI — Project Report

**Project Name:** AttendAI — Smart Attendance System  
**Institution:** Chandigarh University (CSE, Section 605A / 601A)  
**Tech Stack:** React 18, Firebase, face-api.js, Tailwind CSS, Vite  
**Deployment:** Vercel  
**Report Date:** March 2026

---

## 1. Project Overview

AttendAI is a full-stack web application that automates student attendance tracking using two complementary methods:

- **QR Code + Face Verification** — Students scan a time-limited QR code displayed by the faculty, after verifying their identity via facial recognition on their own device.
- **Face Kiosk** — A shared kiosk (e.g., a laptop at the classroom door) that automatically identifies and marks students as they walk in front of the camera.

The system is built for university use (Chandigarh University, CSE 2nd Year) but is architected to support schools as well. It supports two user roles — Admin and Faculty — with role-based access control throughout.

---

## 2. Problem Statement

Traditional attendance systems (paper registers, manual roll calls) are:
- Time-consuming, eating into lecture time
- Prone to proxy attendance (one student marking for another)
- Difficult to aggregate into reports or notify parents/guardians

AttendAI addresses all three issues: attendance is marked in seconds, face verification prevents proxies, and absence notifications are sent automatically via email.

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 (functional components, hooks) |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| Build Tool | Vite 5 |
| Backend / Database | Firebase Firestore (NoSQL, real-time) |
| Authentication | Firebase Auth (email/password) |
| Face Recognition | face-api.js (TinyFaceDetector + FaceRecognitionNet) |
| QR Code Generation | qrcode.react |
| QR Code Scanning | html5-qrcode |
| Email Notifications | EmailJS (@emailjs/browser) |
| Hosting | Vercel |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                    │
│                                                     │
│  Pages          Services           Context          │
│  ─────          ────────           ───────          │
│  Landing        authService        AuthContext      │
│  Login          qrService          (user, role,     │
│  Dashboard      faceService         instType)       │
│  Students       attendanceStore                     │
│  Subjects       dataService                         │
│  Timetable      emailService                        │
│  Attendance     seedFirestore                       │
│  LiveSession                                        │
│  StudentScanner  Components                         │
│  FaceKiosk       ──────────                         │
│  Reports         UI: Card, Button, Badge            │
│  SessionDetail   Layout: Sidebar, Header            │
│                  Dashboard: StatCard, BarChart,     │
│                             QuickActions            │
└──────────────────────┬──────────────────────────────┘
                       │ Firebase SDK
          ┌────────────▼────────────┐
          │      Firebase           │
          │  ┌──────────────────┐   │
          │  │  Firestore DB    │   │
          │  │  collections:    │   │
          │  │  - users         │   │
          │  │  - students      │   │
          │  │  - sessions      │   │
          │  │  - subjects      │   │
          │  │  - timetable     │   │
          │  │  - teachers      │   │
          │  └──────────────────┘   │
          │  ┌──────────────────┐   │
          │  │  Firebase Auth   │   │
          │  └──────────────────┘   │
          └─────────────────────────┘
```

---

## 5. Application Routes

| Route | Component | Access |
|---|---|---|
| `/` | Landing | Public |
| `/login` | Login | Public |
| `/scan` | StudentScanner | Public (student-facing) |
| `/dashboard` | Dashboard | Protected |
| `/students` | Students | Protected |
| `/subjects` | Subjects | Protected |
| `/timetable` | Timetable | Protected |
| `/attendance` | Attendance | Protected |
| `/live-session` | LiveSession | Protected |
| `/reports` | Reports | Protected |
| `/session/:sessionId` | SessionDetail | Protected |
| `/kiosk` | FaceKiosk | Protected |

Protected routes redirect to `/login` if the user is not authenticated. The `/scan` route is intentionally public so students can access it without a faculty login.

---

## 6. Authentication & Role System

Authentication is handled by Firebase Auth. On login, the user's Firestore profile (`users/{uid}`) is loaded to determine their role and institution type.

### User Context Shape
```js
{
  name: string,
  email: string,
  role: 'admin' | 'faculty',
  instType: 'school' | 'college',
  sections: string[]   // assigned sections (faculty only)
}
```

### Role Matrix

| Feature | Admin | Faculty |
|---|---|---|
| Add / Edit / Delete Students | Yes | No |
| Add / Edit Subjects | Yes | No |
| Edit Timetable | Yes | No |
| Take Attendance | Yes | Yes |
| View All Reports | Yes | No |
| View Own Reports | Yes | Yes |
| Export CSV | Yes | Yes |
| Send Absence Notifications | Yes | Yes |
| Seed / Update Student Roster | Yes | Yes |

---

## 7. Core Features

### 7.1 QR Code Attendance (University Mode)

**Faculty side (`/live-session`):**
1. Faculty starts a session from `/attendance`, which creates a Firestore document in the `sessions` collection.
2. A QR code is generated every 5 seconds using a time-based token (`btoa(sessionId + Math.floor(Date.now() / 5000))`), making each code valid for only one 5-second window.
3. The QR code is displayed on the projector/screen using `qrcode.react`.
4. Real-time updates arrive via a Firestore `onSnapshot` listener — the present count and recent scans list update live as students scan.

**Student side (`/scan`):**
1. Student enters their UID. The app performs a live Firestore lookup with a 600ms debounce.
2. If the student has no face registered, they are prompted to register (one-time setup, ~5 seconds).
3. If face is registered, identity is verified by comparing a live camera frame against stored descriptors using `faceapi.euclideanDistance`. Threshold: 0.5.
4. After verification, the student scans the QR code using `html5-qrcode` (back camera).
5. Attendance is written to Firestore using a transaction with a dedup sentinel document (`sessions/{id}/attendanceRecords/uid_{studentUID}`) to prevent duplicate entries even under concurrent writes.

### 7.2 Face Kiosk (`/kiosk`)

A shared device (laptop/tablet) placed at the classroom entrance. No student interaction required beyond standing in front of the camera.

1. On load, the kiosk finds the most recent active session from Firestore.
2. All student face descriptors are loaded from Firestore into memory.
3. The camera runs a detection loop every 1200ms using `faceapi.TinyFaceDetector`.
4. Each detected face is compared against all loaded descriptors (best-of-N matching). Threshold: 0.65.
5. A student must be detected in 2 consecutive frames before attendance is marked (reduces false positives).
6. On match, a "Welcome!" overlay appears for 3 seconds and attendance is written to Firestore.
7. Duplicate detection prevents the same student from being marked twice.

### 7.3 Face Registration & Verification

Implemented in `src/services/faceService.js` using `face-api.js` with three pre-trained models served from `/public/models/`:
- `tiny_face_detector` — fast face detection
- `face_landmark_68` — 68-point facial landmarks
- `face_recognition` — 128-dimension face descriptor

**Registration:** Captures 8 raw descriptors (not averaged) over ~3 seconds. Stored in Firestore as a map `{ d0: [...], d1: [...], count: 8 }` since Firestore does not support nested arrays.

**Verification:** Compares a live descriptor against all stored descriptors and takes the minimum (best) distance. This "best-of-N" approach is significantly more accurate than single-descriptor comparison.

### 7.4 Session Detail & Absence Notifications (`/session/:id`)

- Loads the session document and all students for that section from Firestore.
- Merges the two datasets to produce a full roster with present/absent status.
- Faculty can filter by All / Present / Absent.
- CSV export generates a downloadable file with UID, name, section, status, time, and method.
- Absence notifications are sent via EmailJS. Faculty can notify all absent students in bulk or a single student. The email includes subject, date, teacher, and section. Duplicate-send prevention is handled by the dedup sentinel in Firestore.

### 7.5 Dashboard

The dashboard loads live statistics from Firestore on mount:
- Total students (Firestore count query)
- Average attendance % across all sessions
- Active sessions count
- Sessions below 75% threshold

Stats are role-aware: faculty see only their own sessions; admins see campus-wide data.

A "Update Student Roster (605A)" button on the dashboard triggers `seedFirestore.js` to replace the students collection with the real 605A data.

### 7.6 Reports (`/reports`)

- Lists all sessions (or faculty's own sessions) from Firestore.
- Shows aggregate stats: average attendance, total sessions, low-attendance sessions.
- Each row is clickable and navigates to the full SessionDetail view.
- CSV export of all session summaries.

---

## 8. Data Model (Firestore)

### `users/{uid}`
```json
{
  "name": "Juned",
  "email": "juned@cu.ac.in",
  "role": "faculty",
  "instType": "college",
  "sections": ["605A"]
}
```

### `students/{docId}`
```json
{
  "uid": "24BCS10047",
  "name": "Rohit Raj",
  "section": "605A",
  "year": "2nd Year",
  "email": "rohit@cumail.in",
  "parentEmail": "parent@gmail.com",
  "faceRegistered": true,
  "faceDescriptorMap": { "d0": [...], "d1": [...], "count": 8 },
  "institution": "college"
}
```

### `sessions/{sessionId}`
```json
{
  "sessionId": "SESSION-1234567890-abc123",
  "subject": "Full Stack",
  "section": "605A",
  "teacher": "Juned",
  "date": "2026-03-22",
  "time": "09:30 AM",
  "room": "208",
  "status": "active",
  "attendees": [ { "studentUID": "24BCS10047", "studentName": "Rohit Raj", "method": "QR", "timestamp": "..." } ],
  "attendeeUIDs": ["24BCS10047"],
  "createdAt": "<serverTimestamp>"
}
```

### `sessions/{sessionId}/attendanceRecords/uid_{studentUID}`
Dedup sentinel document — one per (session, student). Written atomically in the same transaction as the attendance record to guarantee no duplicates.

---

## 9. Anti-Proxy Mechanisms

| Mechanism | How it works |
|---|---|
| Time-limited QR | QR token rotates every 5 seconds; screenshots are useless after one window |
| Face verification before scan | Student must pass face check on their own device before the QR scanner opens |
| Firestore transaction dedup | Atomic transaction with a sentinel doc prevents duplicate writes even under race conditions |
| Face kiosk consecutive-frame check | Requires 2 consecutive detections before marking, reducing false positives |
| Already-marked overlay | Kiosk shows a clear "No Duplicate Attendance" message if the same face appears again |

---

## 10. Email Notification System

Powered by EmailJS (free tier: 200 emails/month). Configured via environment variables:

```
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID
VITE_EMAILJS_PUBLIC_KEY
```

The system checks `isEmailConfigured()` before attempting to send and shows a setup guide in the UI if credentials are missing. Bulk sends include a 300ms delay between emails to avoid rate limiting.

---

## 11. Timetable

The timetable for Section 601A (Chandigarh University, CSE 2nd Year) is hardcoded in `src/data/timetable.js` and covers Monday–Friday with real subjects, teachers, rooms, and time slots. The `lectureDetector.js` utility uses the current day and time to automatically detect the ongoing lecture when a session is started, pre-filling the subject and room fields.

**Subjects in timetable:**
Full Stack (Juned), Competitive Coding (Shivam), Software Engineering (Dr. Siddharth Arora), DAA (Shaqlain), DAA Lab (Shaqlain), Operating Systems (Shabnam), Java (Subham K Mishra), Java Lab (Subham K Mishra), Soft Skills (Komal Dhiman), Aptitude (Ashish Agrawal), Intro to ML (Neeraj).

---

## 12. Project File Structure

```
attendai/
├── public/
│   ├── manifest.json
│   └── models/                    # face-api.js pre-trained model weights
│       ├── tiny_face_detector_model-*
│       ├── face_landmark_68_model-*
│       └── face_recognition_model-*
│
├── src/
│   ├── App.jsx                    # Router + ProtectedRoute + PublicRoute
│   ├── main.jsx                   # React entry point
│   ├── index.css                  # Tailwind base styles + custom animations
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Card.jsx           # Reusable card container
│   │   │   ├── Button.jsx         # Multi-variant button (primary/outline/ghost)
│   │   │   └── Badge.jsx          # Status badge (success/warning/neutral)
│   │   ├── layout/
│   │   │   ├── DashboardLayout.jsx # Sidebar + Header wrapper
│   │   │   ├── Sidebar.jsx        # Navigation with role badge
│   │   │   └── Header.jsx         # Top bar with notifications
│   │   └── dashboard/
│   │       ├── StatCard.jsx       # KPI stat card
│   │       ├── BarChart.jsx       # Weekly attendance bar chart
│   │       └── QuickActions.jsx   # Role-based quick action buttons
│   │
│   ├── pages/
│   │   ├── Landing.jsx            # Marketing / hero page
│   │   ├── Login.jsx              # Firebase Auth login form
│   │   ├── Dashboard.jsx          # Live stats + quick actions
│   │   ├── Students.jsx           # Student directory (CRUD for admin)
│   │   ├── Subjects.jsx           # Subject listing
│   │   ├── Timetable.jsx          # Weekly schedule view
│   │   ├── Attendance.jsx         # Session setup (mode, subject, section)
│   │   ├── LiveSession.jsx        # QR display + real-time scan feed
│   │   ├── StudentScanner.jsx     # Student-facing: UID → face → QR scan
│   │   ├── FaceKiosk.jsx          # Shared kiosk: auto face recognition
│   │   ├── Reports.jsx            # Session list + aggregate stats + CSV export
│   │   └── SessionDetail.jsx      # Per-session roster + absence notifications
│   │
│   ├── context/
│   │   └── AuthContext.jsx        # isAuthenticated, user, login, logout
│   │
│   ├── services/
│   │   ├── firebase.js            # Firebase app init + Firestore export
│   │   ├── authService.js         # Firebase Auth + Firestore profile load
│   │   ├── qrService.js           # QR generation, validation, session CRUD
│   │   ├── faceService.js         # face-api.js: load models, capture, compare
│   │   ├── attendanceStore.js     # Firestore attendance with transaction dedup
│   │   ├── dataService.js         # Central Firestore CRUD for all collections
│   │   ├── emailService.js        # EmailJS absence notifications
│   │   ├── studentService.js      # Student-specific helpers
│   │   ├── attendanceService.js   # Legacy placeholder (stub)
│   │   └── seedFirestore.js       # Seed / reseed student roster
│   │
│   ├── data/
│   │   ├── students.js            # Static student data (601A/B, 602)
│   │   ├── timetable.js           # CU 601A weekly timetable
│   │   ├── subjects.js            # Subject definitions
│   │   ├── teachers.js            # Teacher list
│   │   ├── sections.js            # Section definitions
│   │   ├── timeSlots.js           # Time slot definitions
│   │   ├── users.js               # Static user credentials (dev reference)
│   │   └── firebaseExport.json    # Firestore seed data snapshot
│   │
│   └── utils/
│       ├── constants.js           # App-wide constants
│       ├── dashboardConfig.js     # Role-based dashboard config (stats, actions)
│       └── lectureDetector.js     # Auto-detect current lecture from timetable
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .env                           # Firebase + EmailJS credentials
└── vercel.json                    # Vercel SPA routing config
```

---

## 13. Section 605A — Real Data

The primary section used in this project is **24BCS_KRG_605A**, Chandigarh University, CSE 2nd Year. All 35 students, their subjects, and the full weekly timetable are seeded into Firestore via `seedFirestore.js`.

### Student Roster (35 students)

| # | UID | Name |
|---|---|---|
| 1 | 24BCS10047 | Rohit Raj |
| 2 | 24BCS10057 | Himanshu Kumar |
| 3 | 24BCS10096 | Diya Sharma |
| 4 | 24BCS10244 | Aashu Babu |
| 5 | 24BCS10247 | Karan Kumar |
| 6 | 24BCS10351 | Prakhar Sisodiya |
| 7 | 24BCS10460 | Harshpreet Kaur |
| 8 | 24BCS10476 | Sahilpreet Singh |
| 9 | 24BCS10558 | Naveen |
| 10 | 24BCS10567 | Shreya Kumari |
| 11 | 24BCS10614 | Bhumika |
| 12 | 24BCS10668 | Vishal Kumar |
| 13 | 24BCS10692 | Shagun Jangra |
| 14 | 24BCS10841 | Dutimaya Pradhan |
| 15 | 24BCS10938 | Shchi Sharda |
| 16 | 24BCS10976 | Rishav Kumar |
| 17 | 24BCS10977 | Shivam Bind |
| 18 | 24BCS11023 | Priyanshu Bindal |
| 19 | 24BCS11042 | Shreya |
| 20 | 24BCS11164 | Garima Sharma |
| 21 | 24BCS11288 | Samar Kumar |
| 22 | 24BCS11317 | Lucky |
| 23 | 24BCS11462 | Muskaan Rajora |
| 24 | 24BCS11651 | Ankit Kumar |
| 25 | 24BCS11679 | Saatvik Sawarn |
| 26 | 24BCS11844 | Paras |
| 27 | 24BCS11875 | Shivam Jaiswal |
| 28 | 24BCS11888 | Yash Kumar Sisodia |
| 29 | 24BCS11918 | Akshata Singh |
| 30 | 24BCS12062 | Love Bhardwaj |
| 31 | 24BCS12269 | Divyanshu Kumar |
| 32 | 24BCS12503 | Aditya Raj |
| 33 | 24BCS12794 | Aarav Sharma |
| 34 | 24BCS12868 | Rudra Pratap Singh |
| 35 | 24BCS12978 | Kumari Riya |

### Subjects (Section 605A)

| Code | Subject | Teacher | Credits | Type |
|---|---|---|---|---|
| FS | Full Stack | Juned | 4 | Theory |
| CC | Competitive Coding | Shivam | 2 | Theory |
| SE | Software Engineering | Dr. Siddharth Arora | 4 | Theory |
| OS | Operating Systems | Shabnam | 4 | Theory |
| DAA | Design and Analysis of Algorithms | Shaqlain | 4 | Theory |
| JAVA | Java | Subham K Mishra | 4 | Theory |
| SS | Soft Skills | Komal Dhiman | 2 | Theory |
| APT | Aptitude | Ashish Agrawal | 2 | Theory |
| ML | Intro to Machine Learning | Neeraj | 3 | Theory |
| DAA-LAB | DAA Lab | Shaqlain | 2 | Lab |
| JAVA-LAB | Java Lab | Subham K Mishra | 2 | Lab |

### Weekly Timetable (Section 605A)

| Day | Time | Subject | Teacher | Room | Type |
|---|---|---|---|---|---|
| Monday | 09:30 – 10:20 | Full Stack | Juned | 208 | Lecture |
| Monday | 10:20 – 11:10 | Competitive Coding | Shivam | 208 | Lecture |
| Monday | 11:20 – 12:10 | Software Engineering | Dr. Siddharth Arora | 208 | Lecture |
| Monday | 01:55 – 02:45 | Soft Skills | Komal Dhiman | 208 | Lecture |
| Tuesday | 09:30 – 10:20 | DAA Lab | Shaqlain | Lab 3 | Lab |
| Tuesday | 10:20 – 11:10 | Operating Systems | Shabnam | 208 | Lecture |
| Tuesday | 11:20 – 12:10 | DAA | Shaqlain | 208 | Lecture |
| Tuesday | 02:45 – 03:35 | Soft Skills | Komal Dhiman | 208 | Lecture |
| Wednesday | 09:30 – 10:20 | DAA | Shaqlain | 208 | Lecture |
| Wednesday | 10:20 – 11:10 | Operating Systems | Shabnam | 208 | Lecture |
| Wednesday | 11:20 – 12:10 | Java | Subham K Mishra | 208 | Lecture |
| Wednesday | 12:10 – 01:00 | Software Engineering | Dr. Siddharth Arora | 208 | Lecture |
| Wednesday | 01:55 – 02:45 | Aptitude | Ashish Agrawal | 208 | Lecture |
| Thursday | 09:30 – 10:20 | Java Lab | Subham K Mishra | Lab 2 | Lab |
| Thursday | 10:20 – 11:10 | Operating Systems | Shabnam | 208 | Lecture |
| Thursday | 11:20 – 12:10 | DAA | Shaqlain | 208 | Lecture |
| Thursday | 12:10 – 01:00 | Software Engineering | Dr. Siddharth Arora | 208 | Lecture |
| Thursday | 01:55 – 02:45 | Aptitude | Ashish Agrawal | 208 | Lecture |
| Friday | 09:30 – 10:20 | Full Stack | Juned | 208 | Lecture |
| Friday | 10:20 – 11:10 | Java | Subham K Mishra | 208 | Lecture |
| Friday | 01:05 – 01:55 | Intro to ML | Neeraj | 208 | Lecture |

---

## 14. Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| react | 18.2.0 | UI framework |
| react-router-dom | 6.22.0 | Client-side routing |
| firebase | 12.11.0 | Auth + Firestore backend |
| face-api.js | 0.22.2 | In-browser face recognition |
| html5-qrcode | 2.3.8 | QR code scanning via camera |
| qrcode.react | 4.2.0 | QR code rendering |
| @emailjs/browser | 4.4.1 | Client-side email sending |
| lucide-react | 0.344.0 | Icon library |
| tailwindcss | 3.4.1 | Utility-first CSS |
| vite | 5.1.4 | Build tool + dev server |

---

## 15. Deployment

The app is deployed on **Vercel**. The `vercel.json` file configures SPA routing (all paths rewrite to `index.html`).

**Build command:** `npm run build`  
**Output directory:** `dist/`  
**Environment variables** (set in Vercel dashboard):
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID
VITE_EMAILJS_PUBLIC_KEY
```

---

## 16. Security Considerations

- Firebase Auth handles credential storage; passwords are never stored in Firestore.
- Firestore security rules restrict read/write access by authenticated users.
- QR tokens are time-bound (5-second window) and base64-encoded with session ID + timestamp.
- Attendance writes use Firestore transactions to prevent race conditions and duplicate entries.
- Face descriptors (128-float arrays) are stored in Firestore, not raw images — no biometric image data is persisted.
- The `/scan` route is public by design (students don't have faculty credentials) but all writes go through the dedup transaction.

---

## 17. Limitations & Future Scope

| Limitation | Potential Improvement |
|---|---|
| Face recognition runs entirely in-browser (CPU) | Offload to a server-side ML API for better accuracy and speed |
| Section hardcoded to 605A in several places | Make section dynamic, driven by the logged-in faculty's profile |
| Timetable is static JS data | Migrate to Firestore so admins can edit it from the UI |
| EmailJS free tier: 200 emails/month | Upgrade to a server-side email service (SendGrid, AWS SES) for production scale |
| No mobile app | Build a React Native companion app for the student scanner flow |
| No offline support | Add a service worker / PWA manifest for offline attendance queuing |
| `attendanceService.js` is a stub | Fully implement or remove in favour of `attendanceStore.js` |
| No unit or integration tests | Add Vitest + React Testing Library coverage |

---

## 18. Summary

AttendAI is a production-deployed, Firebase-backed React application that solves the proxy attendance problem in university classrooms. It combines time-limited QR codes, client-side face recognition, and atomic Firestore transactions to deliver a fast, tamper-resistant attendance workflow. The role-based access system, real-time dashboard, per-session rosters, and automated absence email notifications make it a complete end-to-end solution for faculty and administrators.
