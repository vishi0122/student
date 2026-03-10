# AttendAI - Quick Start Guide

Get AttendAI up and running in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A code editor (VS Code recommended)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including React, React Router, Tailwind CSS, and Lucide icons.

### 2. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 3. Login to the System

Use any email/password combination. The system currently uses mock authentication.

**Try these configurations:**

**School Administrator:**
- Institution: School
- Role: Administrator
- Email: admin@school.edu
- Password: password123

**College Faculty:**
- Institution: College/University
- Role: Faculty
- Email: faculty@college.edu
- Password: password123

## Exploring the Application

### As Administrator (School)
1. View school-wide statistics
2. Manage student directory
3. Add/edit subjects
4. Configure timetables
5. View comprehensive reports

### As Faculty (College)
1. View your lecture statistics
2. Generate QR codes for attendance
3. Start live attendance sessions
4. View student lists
5. Access personal analytics

## Key Features to Test

### 1. Attendance Modes

**School Mode (Face Recognition):**
- Navigate to "Take Attendance"
- Select "School Mode"
- Choose subject and section
- Click "Start Camera Scan"
- Watch simulated face recognition

**University Mode (QR Code):**
- Navigate to "Take Attendance"
- Select "University Mode"
- Choose subject and section
- Click "Start QR Session"
- View dynamic QR code display

### 2. Live Session

- Start an attendance session
- Watch real-time counter increment
- See students being verified
- End session when complete

### 3. Student Management

- View student directory
- Check face profile status
- Search students by name/roll number
- (Admin only) Add new students

### 4. Reports & Analytics

- View attendance statistics
- Check weekly trends
- Export reports (coming soon)
- Monitor low attendance alerts

## Project Structure Overview

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components (routes)
├── context/        # React Context (Auth)
├── services/       # API services (Firebase ready)
└── utils/          # Helper functions
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#1E3A8A',  // Change this
      accent: '#10B981',   // Change this
    }
  }
}
```

### Modify Dashboard Stats

Edit `src/utils/dashboardConfig.js` to customize statistics for each role.

### Add New Routes

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation item in `src/components/layout/Sidebar.jsx`

## Next Steps

### 1. Set Up Firebase (Optional)

```bash
npm install firebase
```

Create `src/firebase/config.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 2. Implement Real Authentication

Update `src/services/authService.js`:

```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};
```

### 3. Connect to Database

Update `src/services/studentService.js`:

```javascript
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const getAllStudents = async () => {
  const querySnapshot = await getDocs(collection(db, 'students'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Check Node version
node --version  # Should be 18+

# Update dependencies
npm update
```

## Development Tips

### Hot Reload
- Changes auto-reload in browser
- No need to restart server
- Check console for errors

### React DevTools
- Install React DevTools browser extension
- Inspect component hierarchy
- Debug state and props

### Tailwind IntelliSense
- Install Tailwind CSS IntelliSense extension in VS Code
- Get autocomplete for Tailwind classes
- See color previews

## Testing Different Roles

The app has 4 different dashboard variants:

1. **School Admin**: Full control, school-wide stats
2. **School Faculty**: Class-focused, limited permissions
3. **College Admin**: Campus-wide management
4. **College Faculty**: Lecture-focused, QR attendance

Switch between them by logging out and selecting different configurations.

## Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Guide](https://reactrouter.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Firebase Docs](https://firebase.google.com/docs)

## Getting Help

- Check `README.md` for detailed documentation
- Review `PROJECT_STRUCTURE.md` for architecture
- See `DEPLOYMENT.md` for deployment guides
- Open an issue on GitHub

## What's Next?

After getting familiar with the app:

1. ✅ Explore all pages and features
2. ✅ Test both attendance modes
3. ✅ Try different user roles
4. 🔄 Set up Firebase backend
5. 🔄 Implement face recognition
6. 🔄 Add QR code generation
7. 🔄 Deploy to production

## Quick Reference

### Login Credentials (Mock)
- Any email/password works
- Select institution type and role
- Data persists until logout

### Navigation
- Sidebar: Main navigation
- Header: Date and notifications
- Mobile: Hamburger menu

### Keyboard Shortcuts
- `Ctrl/Cmd + K`: Search (coming soon)
- `Esc`: Close modals
- `Tab`: Navigate forms

## Support

Need help? Check:
- Documentation files in project root
- Code comments in source files
- Console logs for debugging
- Browser DevTools for errors

Happy coding! 🚀
