# Environment Setup Guide

## Overview

This project uses Vite and requires environment variables for Firebase and EmailJS configuration. The app will use fallback/default credentials if env vars are missing, but **for production deployment, you must configure your own**.

## Quick Setup (Development)

### 1. Create `.env.local` file

In the project root, create a `.env.local` file:

```bash
cp .env.example .env.local
```

### 2. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **students-1b03c**
3. Click **Project Settings** (gear icon)
4. Copy values under "Web apps" section:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=students-1b03c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=students-1b03c
VITE_FIREBASE_STORAGE_BUCKET=students-1b03c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=776620371587
VITE_FIREBASE_APP_ID=1:776620371587:web:42ba0d9029ada144b475b6
VITE_FIREBASE_MEASUREMENT_ID=G-7C6VZKP2RJ
```

### 3. (Optional) Get EmailJS Credentials

For automated absence notifications:

1. Go to [EmailJS](https://www.emailjs.com/)
2. Create account and service
3. Get Service ID, Template ID, and Public Key
4. Add to `.env.local`:

```env
VITE_EMAILJS_SERVICE_ID=service_...
VITE_EMAILJS_TEMPLATE_ID=template_...
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### 4. Run the app

```bash
npm install
npm run dev
```

---

## Production Deployment

### Security Checklist

- ✅ **Never commit `.env.local`** — it contains secrets
- ✅ **Add `.env.local` to `.gitignore`** (already configured)
- ✅ In production, use your platform's secret manager:
  - **Vercel**: Environment Variables in dashboard
  - **Netlify**: Build & Deploy → Environment
  - **GitHub Pages**: Not recommended for secrets (static only)

### Example: Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel
# Follow prompts, add env vars in Vercel dashboard
```

### Example: GitHub Actions Secret

```yaml
# .github/workflows/deploy.yml
env:
  VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
  VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
  # ... other vars
```

---

## Troubleshooting

### App stops working after 5 minutes

**Issue**: Memory leak in face recognition code  
**Fix**: Already applied in this version. Ensure you:
- Have the latest code with `disposeModels()` calls
- Aren't running very old cached version (hard refresh: `Ctrl+Shift+R`)

### Firebase connection fails

**Check**:
```javascript
// In browser console
import { db } from './src/services/firebase';
console.log(db); // Should show Firestore instance, not undefined
```

If undefined, verify `.env.local` is created correctly.

### EmailJS notifications not sending

**Check**:
```javascript
// In browser console
import { isEmailConfigured } from './src/services/emailService';
console.log(isEmailConfigured()); // Should be true if configured
```

If false, create `.env.local` with EmailJS credentials.

---

## Verify Setup

Run these checks:

```bash
# 1. Firebase loaded correctly
npm run dev
# Browser console: no Firebase errors

# 2. Leave app open 10+ minutes
# Expected: No slowdown, stable performance

# 3. Open DevTools → Performance
# Expected: Memory usage stable (~50-100MB)
```

---

## Reference

- [Firebase Console](https://console.firebase.google.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [EmailJS Docs](https://www.emailjs.com/docs/)

---

*Last updated: October 26, 2026*
