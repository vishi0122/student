# 📷 Camera Setup Guide - AttendAI Scanner

## Why Camera Doesn't Work on Localhost

### The Issue
When you test on `http://localhost:5173`, the camera permission is **blocked by browsers** for security reasons.

### Why This Happens
- Modern browsers (Chrome, Safari, Firefox) **require HTTPS** for camera access
- `http://localhost` is considered **insecure**
- Camera API only works on:
  - ✅ `https://` (secure HTTPS)
  - ✅ `localhost` (but with limitations)
  - ❌ `http://` (blocked for security)

---

## ✅ Solution: Deploy to Vercel (HTTPS)

Once you deploy to Vercel, you get **automatic HTTPS**, and the camera will work perfectly!

### After Deployment:
1. Visit: `https://your-app.vercel.app/scan`
2. Click "Start Camera Scanner"
3. Browser asks: "Allow camera access?"
4. Click "Allow"
5. Camera activates! ✅

---

## 🧪 Testing Camera Locally (Workaround)

If you want to test camera on localhost:

### Option 1: Use HTTPS Locally (Advanced)

```bash
# Install mkcert
npm install -g mkcert

# Create local certificate
mkcert create-ca
mkcert create-cert

# Update vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./cert.key'),
      cert: fs.readFileSync('./cert.crt'),
    }
  }
})

# Run dev server
npm run dev
# Now visit: https://localhost:5173
```

### Option 2: Test on Mobile with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Run your dev server
npm run dev

# In another terminal, expose it
ngrok http 5173

# You get: https://abc123.ngrok.io
# Test on mobile with this URL
```

### Option 3: Just Deploy to Vercel (Easiest!)

Skip local testing and deploy directly to Vercel. It's free and takes 2 minutes!

---

## 📱 How Camera Permission Works

### First Time (After Deployment):

1. **Student visits**: `https://your-app.vercel.app/scan`
2. **Enters UID**: 24BCS10001
3. **Clicks**: "Start Camera Scanner"
4. **Browser shows popup**: "Allow camera access?"
5. **Student clicks**: "Allow"
6. **Camera activates**: Ready to scan!

### Next Time:

1. **Student visits**: Same URL
2. **Clicks**: "Start Camera Scanner"
3. **Camera activates immediately**: No popup (permission remembered)

---

## 🔧 Troubleshooting Camera Issues

### Problem 1: "Camera not working"

**Check:**
- ✅ URL starts with `https://` (not `http://`)
- ✅ Browser supports camera (Chrome, Safari, Firefox)
- ✅ Device has a camera
- ✅ Camera not being used by another app

**Solution:**
1. Close other apps using camera
2. Refresh the page
3. Try different browser
4. Check browser settings

### Problem 2: "Permission denied"

**Reason:** Student clicked "Block" when asked for camera access

**Solution:**
1. Click the camera icon in address bar (or lock icon)
2. Find "Camera" permission
3. Change to "Allow"
4. Refresh the page

**Chrome:**
- Click lock icon → Site settings → Camera → Allow

**Safari (iOS):**
- Settings → Safari → Camera → Allow

**Firefox:**
- Click lock icon → Permissions → Camera → Allow

### Problem 3: "Camera permission not asked"

**Reason:** Browser blocked the popup

**Solution:**
1. Check if popup blocker is active
2. Disable popup blocker for your site
3. Refresh and try again

### Problem 4: "Black screen after allowing camera"

**Reason:** Camera is being used by another app

**Solution:**
1. Close all other apps
2. Close all other browser tabs
3. Refresh the page
4. Try again

---

## 🎯 Best Practices

### For Testing:
1. **Always test on HTTPS** (deploy to Vercel)
2. **Test on actual mobile devices** (not just desktop)
3. **Test on different browsers** (Chrome, Safari, Firefox)
4. **Test with different students** (different devices)

### For Production:
1. **Use Vercel or similar** (automatic HTTPS)
2. **Create QR code posters** (easy access for students)
3. **Share HTTPS URL only** (never HTTP)
4. **Provide troubleshooting guide** (for students)

---

## 📊 Browser Compatibility

### Desktop:
- ✅ Chrome 53+ (Windows, Mac, Linux)
- ✅ Firefox 36+ (Windows, Mac, Linux)
- ✅ Edge 79+ (Windows, Mac)
- ✅ Safari 11+ (Mac)
- ❌ Internet Explorer (not supported)

### Mobile:
- ✅ Chrome (Android)
- ✅ Safari (iOS 11+)
- ✅ Firefox (Android)
- ✅ Samsung Internet
- ⚠️ Opera Mini (limited support)

---

## 🔒 Security & Privacy

### What We Access:
- ✅ Camera feed (for QR scanning only)
- ✅ Temporary video stream
- ❌ No photos saved
- ❌ No video recorded
- ❌ No data stored

### How It Works:
1. Student allows camera access
2. Camera stream goes to QR scanner
3. QR code detected → Attendance marked
4. Camera stops → Stream deleted
5. Nothing saved on device or server

### Student Privacy:
- No photos taken
- No video recorded
- Only QR code data processed
- Camera stops after scan
- Permission can be revoked anytime

---

## 📱 Student Instructions (After Deployment)

### Simple Steps:

1. **Open Browser** on your phone
2. **Visit**: `https://your-app.vercel.app/scan`
3. **Enter UID**: Your student ID
4. **Click**: "Start Camera Scanner"
5. **Allow Camera**: Click "Allow" when asked
6. **Point at QR Code**: On teacher's screen
7. **Wait**: Automatic detection (1-2 seconds)
8. **Done**: Attendance marked! ✅

### First Time Setup:
- Browser will ask for camera permission
- Click "Allow" (one-time only)
- Next time, camera works immediately

### If Camera Doesn't Work:
1. Make sure URL starts with `https://`
2. Check camera permission in browser settings
3. Close other apps using camera
4. Try different browser
5. Ask teacher for help

---

## 🎉 Summary

### The Key Point:
**Camera ONLY works on HTTPS, not HTTP!**

### For Local Testing:
- Camera won't work on `http://localhost`
- This is normal browser security
- Use ngrok or deploy to test camera

### For Production:
- Deploy to Vercel (automatic HTTPS)
- Camera works perfectly
- Students can scan from anywhere
- No setup needed!

### Next Steps:
1. ✅ Code updated with better error messages
2. ✅ Build tested successfully
3. 🚀 Deploy to Vercel
4. 📱 Test camera on production URL
5. ✅ Share with students

---

**Last Updated**: March 11, 2026  
**Status**: Camera setup improved with error handling  
**Next**: Deploy to Vercel for HTTPS and working camera!
