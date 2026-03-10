# AttendAI - Smart Attendance System

An AI-based Smart Attendance System for Schools and Universities featuring dual-mode attendance tracking: facial recognition for schools and QR + face verification for universities.

## Features

- **Role-Based Access Control**: Separate dashboards for Administrators and Faculty
- **Institution Type Support**: Optimized for both Schools and Universities
- **Dual Attendance Modes**:
  - School Mode: High-speed group facial recognition
  - University Mode: Dynamic QR + mobile face verification
- **Real-time Attendance Tracking**: Live session monitoring
- **Comprehensive Analytics**: Detailed reports and insights
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern SaaS UI**: Clean, professional dashboard interface

## Tech Stack

- **Frontend**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Backend Ready**: Structured for Firebase integration

## Project Structure

```
attendai/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Card.jsx
│   │   │   ├── Button.jsx
│   │   │   └── Badge.jsx
│   │   ├── layout/          # Layout components
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   └── dashboard/       # Dashboard-specific components
│   │       ├── StatCard.jsx
│   │       ├── BarChart.jsx
│   │       └── QuickActions.jsx
│   ├── pages/               # Page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Students.jsx
│   │   ├── Subjects.jsx
│   │   ├── Timetable.jsx
│   │   ├── Attendance.jsx
│   │   ├── LiveSession.jsx
│   │   └── Reports.jsx
│   ├── context/             # React Context
│   │   └── AuthContext.jsx
│   ├── services/            # API services (Firebase ready)
│   │   ├── authService.js
│   │   ├── studentService.js
│   │   └── attendanceService.js
│   ├── utils/               # Utility functions
│   │   ├── constants.js
│   │   └── dashboardConfig.js
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd attendai
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Routes

- `/` - Landing page
- `/login` - Login page
- `/dashboard` - Main dashboard (role-based)
- `/students` - Student management
- `/subjects` - Subject management
- `/timetable` - Timetable management
- `/attendance` - Start attendance session
- `/live-session` - Live attendance tracking
- `/reports` - Analytics and reports

## User Roles

### Administrator
- Full access to all features
- Manage students, subjects, and timetables
- View campus-wide analytics
- System configuration

### Faculty
- View assigned students and subjects
- Take attendance for classes
- View personal analytics
- Manage class schedules

## Institution Types

### School Mode
- Group facial recognition
- Fixed class sections
- Period-based scheduling
- Simplified interface

### University Mode
- QR code + face verification
- Multiple lecture halls
- Flexible scheduling
- Scalable for large classes

## Firebase Integration (Coming Soon)

The project is structured to easily integrate Firebase:

1. **Authentication**: `src/services/authService.js`
2. **Firestore Database**: `src/services/studentService.js`, `src/services/attendanceService.js`
3. **Storage**: For face recognition data
4. **Cloud Functions**: For backend processing

### Setup Firebase

1. Create a Firebase project
2. Add Firebase config to `src/firebase/config.js`
3. Implement service functions in `src/services/`
4. Update context providers to use Firebase auth

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@attendai.com or open an issue in the repository.

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI inspiration from modern SaaS dashboards
- Built with [Vite](https://vitejs.dev/) and [React](https://react.dev/)
