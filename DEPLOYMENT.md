# AttendAI - Deployment Guide

This guide covers deploying AttendAI to various platforms.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- Project built successfully locally

## Build the Project

Before deploying, ensure the project builds without errors:

```bash
npm install
npm run build
```

This creates an optimized production build in the `dist/` directory.

---

## Option 1: Deploy to Vercel (Recommended)

Vercel offers the easiest deployment with automatic CI/CD.

### Method A: Using Vercel CLI

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Deploy to Production**
```bash
vercel --prod
```

### Method B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel auto-detects Vite configuration
5. Click "Deploy"

### Environment Variables (Vercel)

Add in Project Settings → Environment Variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- etc.

---

## Option 2: Deploy to Netlify

### Method A: Using Netlify CLI

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login**
```bash
netlify login
```

3. **Initialize**
```bash
netlify init
```

4. **Deploy**
```bash
netlify deploy --prod
```

### Method B: Using Netlify Dashboard

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

### netlify.toml Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Option 3: Deploy to Firebase Hosting

### Setup

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login**
```bash
firebase login
```

3. **Initialize Firebase**
```bash
firebase init hosting
```

Configuration:
- Public directory: `dist`
- Single-page app: `Yes`
- Automatic builds: `No` (or Yes for GitHub integration)

4. **Build the project**
```bash
npm run build
```

5. **Deploy**
```bash
firebase deploy --only hosting
```

### firebase.json Configuration

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## Option 4: Deploy to GitHub Pages

### Using gh-pages package

1. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

2. **Update package.json**

Add homepage and scripts:

```json
{
  "homepage": "https://yourusername.github.io/attendai",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Update vite.config.js**

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/attendai/', // Your repo name
});
```

4. **Deploy**
```bash
npm run deploy
```

---

## Option 5: Deploy to AWS S3 + CloudFront

### Setup S3 Bucket

1. Create S3 bucket
2. Enable static website hosting
3. Set bucket policy for public read access

### Upload Files

```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

### CloudFront Distribution

1. Create CloudFront distribution
2. Set origin to S3 bucket
3. Configure error pages to redirect to index.html
4. Update DNS records

---

## Option 6: Deploy to Docker

### Create Dockerfile

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Create nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Build and Run

```bash
docker build -t attendai .
docker run -p 80:80 attendai
```

---

## Post-Deployment Checklist

- [ ] Test all routes work correctly
- [ ] Verify authentication flow
- [ ] Check responsive design on mobile
- [ ] Test in different browsers
- [ ] Verify environment variables are set
- [ ] Check console for errors
- [ ] Test attendance modes (School/University)
- [ ] Verify role-based access control
- [ ] Check analytics and reports
- [ ] Test live session functionality

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify
1. Go to Site Settings → Domain management
2. Add custom domain
3. Configure DNS

### Firebase
1. Go to Hosting → Add custom domain
2. Follow verification steps
3. Update DNS records

---

## Environment Variables

Required for production:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Continuous Deployment

### GitHub Actions (Example)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

---

## Troubleshooting

### Build Fails
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Verify all dependencies are installed

### Routes Don't Work (404 on refresh)
- Ensure SPA redirect is configured
- Check server configuration for fallback to index.html

### Environment Variables Not Working
- Prefix with `VITE_` for Vite projects
- Rebuild after adding variables
- Check variable names match exactly

### Slow Load Times
- Enable gzip compression
- Configure CDN caching
- Optimize images and assets
- Use code splitting

---

## Performance Optimization

1. **Enable Compression**
   - Gzip or Brotli compression
   - Configured automatically on most platforms

2. **CDN Configuration**
   - Cache static assets
   - Set appropriate cache headers

3. **Code Splitting**
   - Already configured with Vite
   - Lazy load routes if needed

4. **Image Optimization**
   - Use WebP format
   - Implement lazy loading
   - Compress images

---

## Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in for Vercel deployments
- **Google Analytics**: Add tracking code
- **Sentry**: Error tracking
- **LogRocket**: Session replay

---

## Support

For deployment issues:
- Check platform-specific documentation
- Review build logs
- Test locally first with `npm run preview`
- Ensure all environment variables are set

---

## Next Steps

After successful deployment:
1. Set up Firebase backend
2. Configure authentication
3. Implement face recognition API
4. Set up QR code generation
5. Add real-time database sync
6. Configure cloud functions
7. Set up monitoring and alerts
