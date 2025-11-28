# School Management System - Complete Deployment Guide

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│       Frontend (React) - Firebase Hosting           │
│    https://school-management.firebaseapp.com         │
└────────────────────┬────────────────────────────────┘
                     │
                     │ HTTPS Requests
                     ▼
┌─────────────────────────────────────────────────────┐
│    Backend API (Node.js) - Render.com               │
│  https://school-management-api.onrender.com/api     │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

- GitHub account (already setup ✓)
- Google account (for Firebase)
- Render account

---

## **Part 1: Deploy Backend to Render.com**

### Step 1.1: Create Render Account

1. Go to https://render.com
2. Click "Sign up"
3. Choose "Continue with GitHub"
4. Authorize and login

### Step 1.2: Deploy Backend Service

1. Click **"New +"** → **"Web Service"**
2. Select repository: **`school-mangment`**
3. Fill in details:
   - **Name**: `school-management-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Click **"Create Web Service"**

### Step 1.3: Get Backend URL

After 2-3 minutes, you'll get a URL like:
```
https://school-management-api.onrender.com
```

**Save this URL!** ⭐

---

## **Part 2: Deploy Frontend to Firebase**

### Step 2.1: Install Firebase Tools

```powershell
npm install -g firebase-tools
```

### Step 2.2: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Create project"**
3. Project name: `school-management`
4. Accept default settings
5. Click **"Create project"**

### Step 2.3: Get Firebase Config

After project creation:
1. Go to **Project Settings** (⚙️ icon)
2. Copy your **Project ID** (e.g., `school-management-abc123`)
3. You'll use this in the next step

### Step 2.4: Login to Firebase

```powershell
firebase login
```

This will open browser to authenticate. Click "Allow".

### Step 2.5: Initialize Firebase in Your Project

```powershell
cd "c:\Users\Lenovo\Learning Skills\jsx-login-app"
firebase init hosting
```

When prompted:
- **Project setup**: Choose `school-management` (your Firebase project)
- **Public directory**: Type `build`
- **Single-page app**: Type `yes`
- **GitHub deploys**: Type `no` (we'll do manual for now)

### Step 2.6: Build React App

```powershell
npm run build
```

This creates an optimized production build in the `build/` folder.

### Step 2.7: Deploy to Firebase

```powershell
firebase deploy
```

After a few minutes, you'll see:
```
Hosting URL: https://school-management.firebaseapp.com
```

---

## ✅ Your Website is Live!

**Frontend**: https://school-management.firebaseapp.com
**Backend API**: https://school-management-api.onrender.com/api

---

## 🔗 How to Add Custom Domain (Optional)

1. **Firebase Console** → **Hosting** → **Domain**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `school.yourdomain.com`)
4. Follow verification steps
5. Update DNS records (provided by Firebase)

---

## 🐛 Troubleshooting

### Backend not connecting?

Check if backend URL is correct:
```javascript
// In LoginPage.jsx and ChatDashboard.jsx
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
```

### CORS errors?

Backend already has CORS enabled:
```javascript
app.use(cors());
```

### Render.com free tier going to sleep?

Free tier spins down after 15 min of inactivity. First request takes 30 sec. Upgrade to paid ($7/month) to avoid this.

---

## 📝 Environment Variables

Frontend uses:
- `REACT_APP_API_URL` - Points to Render backend in production
- Automatically uses `http://localhost:5001/api` in development

---

## 🔄 Future Updates

To update after making changes:

1. **Backend changes**:
   ```powershell
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
   Render automatically redeploys!

2. **Frontend changes**:
   ```powershell
   cd jsx-login-app
   npm run build
   firebase deploy
   ```

---

**Tayyar ho gaya! Your website is now live on the internet! 🎉**
