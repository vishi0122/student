# PWA Icons Setup

## Required Icons

For the PWA (Progressive Web App) to work properly, you need two icon files:

- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

## Quick Setup Options

### Option 1: Use Online Generator (Easiest)

1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your logo or create a simple icon
3. Download the generated icons
4. Place `icon-192.png` and `icon-512.png` in this `public/` folder

### Option 2: Create Simple Icons

Use any image editor (Photoshop, Figma, Canva) to create:

**Design Suggestions:**
- Background: Blue (#1E3A8A)
- Icon: White QR code or "A" letter
- Size: 512x512px (will auto-scale to 192x192)
- Format: PNG with transparency

### Option 3: Use Placeholder (Temporary)

For testing, you can use a simple colored square:
1. Create a 512x512px blue square
2. Add white text "AttendAI" or "A"
3. Save as both icon-192.png and icon-512.png

## Icon Design Ideas

```
┌─────────────────┐
│                 │
│   ███  ███      │  AttendAI Logo
│   ███  ███      │  (QR Code Style)
│                 │
│   ███  ███      │
│   ███  ███      │
│                 │
└─────────────────┘
```

Or simply:

```
┌─────────────────┐
│                 │
│                 │
│       A         │  Simple "A" Letter
│                 │
│                 │
│                 │
└─────────────────┘
```

## Verify Icons

After adding icons, check:
1. Files exist: `public/icon-192.png` and `public/icon-512.png`
2. Correct sizes: 192x192 and 512x512 pixels
3. PNG format with transparency (optional)

## Testing PWA

Once icons are in place:
1. Deploy to Vercel
2. Open on mobile: `https://your-app.vercel.app/scan`
3. Look for "Add to Home Screen" option
4. Install and check if icon appears correctly

---

**Note**: The app will work without icons, but they're needed for a professional PWA installation experience.
