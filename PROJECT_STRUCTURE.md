# AttendAI - Complete Project Structure

```
attendai/
│
├── public/                          # Static assets
│   └── vite.svg
│
├── src/                             # Source code
│   │
│   ├── components/                  # Reusable components
│   │   │
│   │   ├── ui/                      # Base UI components
│   │   │   ├── Card.jsx            # Card container component
│   │   │   ├── Button.jsx          # Button with variants
│   │   │   └── Badge.jsx           # Status badge component
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── DashboardLayout.jsx # Main dashboard wrapper
│   │   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   │   └── Header.jsx          # Top header bar
│   │   │
│   │   └── dashboard/               # Dashboard-specific components
│   │       ├── StatCard.jsx        # Statistics card
│   │       ├── BarChart.jsx        # Bar chart visualization
│   │       └── QuickActions.jsx    # Quick action buttons
│   │
│   ├── pages/                       # Page components (routes)
│   │   ├── Landing.jsx             # Landing page (/)
│   │   ├── Login.jsx               # Login page (/login)
│   │   ├── Dashboard.jsx           # Main dashboard (/dashboard)
│   │   ├── Students.jsx            # Student management (/students)
│   │   ├── Subjects.jsx            # Subject management (/subjects)
│   │   ├── Timetable.jsx           # Timetable view (/timetable)
│   │   ├── Attendance.jsx          # Attendance setup (/attendance)
│   │   ├── LiveSession.jsx         # Live attendance (/live-session)
│   │   └── Reports.jsx             # Reports & analytics (/reports)
│   │
│   ├── context/                     # React Context providers
│   │   └── AuthContext.jsx         # Authentication context
│   │
│   ├── services/                    # API service layer (Firebase ready)
│   │   ├── authService.js          # Authentication operations
│   │   ├── studentService.js       # Student CRUD operations
│   │   └── attendanceService.js    # Attendance operations
│   │
│   ├── utils/                       # Utility functions
│   │   ├── constants.js            # App constants
│   │   └── dashboardConfig.js      # Dashboard configurations
│   │
│   ├── App.jsx                      # Main app component with routing
│   ├── main.jsx                     # Application entry point
│   └── index.css                    # Global styles (Tailwind)
│
├── .github/                         # GitHub specific files
│   └── workflows/                   # CI/CD workflows (optional)
│
├── .gitignore                       # Git ignore rules
├── .eslintrc.cjs                    # ESLint configuration
├── index.html                       # HTML entry point
├── package.json                     # Dependencies and scripts
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── README.md                        # Project documentation
├── DEPLOYMENT.md                    # Deployment guide
├── ANALYSIS.md                      # Code analysis
└── PROJECT_STRUCTURE.md             # This file
```

## Component Hierarchy

```
App
├── BrowserRouter
│   └── AuthProvider
│       └── Routes
│           ├── Landing (Public)
│           ├── Login (Public)
│           └── Protected Routes
│               ├── Dashboard
│               │   └── DashboardLayout
│               │       ├── Sidebar
│               │       ├── Header
│               │       └── Content
│               │           ├── StatCard (x4)
│               │           ├── BarChart
│               │           └── QuickActions
│               │
│               ├── Students
│               │   └── DashboardLayout
│               │       └── DataTable
│               │
│               ├── Subjects
│               │   └── DashboardLayout
│               │       └── DataTable
│               │
│               ├── Timetable
│               │   └── DashboardLayout
│               │       └── Schedule Cards
│               │
│               ├── Attendance
│               │   └── DashboardLayout
│               │       └── Mode Selection
│               │
│               ├── LiveSession
│               │   └── DashboardLayout
│               │       ├── Session Header
│               │       ├── Camera/QR View
│               │       └── Verification List
│               │
│               └── Reports
│                   └── DashboardLayout
│                       ├── Stat Cards
│                       └── Report List
```

## Data Flow

```
User Action
    ↓
Page Component
    ↓
Service Layer (authService, studentService, attendanceService)
    ↓
Firebase Backend (Future)
    ↓
Context Update (AuthContext)
    ↓
UI Re-render
```

## Routing Structure

```
/ (Landing)
    → /login (Login)
        → /dashboard (Dashboard - Role Based)
            ├── /students (Student Management)
            ├── /subjects (Subject Management)
            ├── /timetable (Timetable)
            ├── /attendance (Attendance Setup)
            │   └── /live-session (Live Attendance)
            └── /reports (Analytics & Reports)
```

## State Management

```
AuthContext
├── isAuthenticated (boolean)
├── user (object)
│   ├── instType ('school' | 'college')
│   └── role ('admin' | 'faculty')
├── login(userData)
└── logout()
```

## Key Features by Page

### Landing Page
- Hero section
- Feature highlights
- Call-to-action buttons
- Dashboard preview

### Login Page
- Institution type selector (School/College)
- Role selector (Admin/Faculty)
- Email/password form
- Responsive design

### Dashboard
- Role-based statistics (4 variants)
- Weekly attendance chart
- Quick action buttons
- Personalized content

### Students
- Student directory table
- Search and filter
- Face profile status
- Admin: Add/Edit students
- Faculty: View only

### Subjects
- Subject listing table
- Course codes
- Instructor assignments
- Section management

### Timetable
- Weekly schedule view
- Day selector
- Time slots
- Room assignments

### Attendance
- Mode selection (School/University)
- Subject/section selector
- Duration settings
- Session initiation

### Live Session
- Real-time counter
- Camera feed (School mode)
- QR code display (University mode)
- Verification list
- Session controls

### Reports
- Attendance statistics
- Exportable reports
- Historical data
- Analytics charts

## Styling System

### Tailwind Configuration
- Primary color: #1E3A8A (Deep Blue)
- Accent color: #10B981 (Emerald Green)
- Custom animations: scan, fadeIn
- Responsive breakpoints: sm, md, lg, xl

### Component Variants
- Button: primary, accent, outline, ghost
- Badge: success, warning, neutral, primary
- Card: base with customizable classes

## Future Enhancements

### Phase 1: Firebase Integration
- [ ] Authentication setup
- [ ] Firestore database
- [ ] Cloud Storage for face data
- [ ] Real-time updates

### Phase 2: AI Features
- [ ] Face recognition API
- [ ] QR code generation
- [ ] Anti-proxy detection
- [ ] Attendance predictions

### Phase 3: Advanced Features
- [ ] Mobile app
- [ ] Parent portal
- [ ] SMS notifications
- [ ] Biometric integration
- [ ] Advanced analytics
- [ ] Export to multiple formats

### Phase 4: Scalability
- [ ] Multi-tenant support
- [ ] API for third-party integration
- [ ] Webhook support
- [ ] Advanced reporting
- [ ] Custom branding

## Development Guidelines

### Code Style
- Use functional components
- Implement proper prop validation
- Follow React hooks best practices
- Keep components small and focused
- Use meaningful variable names

### File Naming
- Components: PascalCase (e.g., DashboardLayout.jsx)
- Services: camelCase (e.g., authService.js)
- Utils: camelCase (e.g., constants.js)
- Pages: PascalCase (e.g., Dashboard.jsx)

### Component Structure
```javascript
// 1. Imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Component definition
const ComponentName = ({ prop1, prop2 }) => {
  // 3. Hooks
  const navigate = useNavigate();
  
  // 4. State
  const [state, setState] = useState(null);
  
  // 5. Effects
  useEffect(() => {}, []);
  
  // 6. Handlers
  const handleClick = () => {};
  
  // 7. Render
  return <div>Content</div>;
};

// 8. Export
export default ComponentName;
```

## Testing Strategy (Future)

### Unit Tests
- Component rendering
- User interactions
- State management
- Utility functions

### Integration Tests
- Page navigation
- Form submissions
- API calls
- Authentication flow

### E2E Tests
- Complete user journeys
- Attendance workflows
- Report generation
- Multi-role scenarios

## Performance Considerations

- Lazy loading for routes
- Code splitting with Vite
- Optimized images
- Memoization where needed
- Efficient re-renders
- Debounced search inputs

## Security Measures

- Protected routes
- Role-based access control
- Input validation
- XSS prevention
- CSRF protection (Firebase)
- Secure authentication

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus management
