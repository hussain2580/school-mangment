# School Management System - Backend Deployment on Render

## Backend API (Node.js + Express)

### Deployment Steps:

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Deploy Backend**
   - New → Web Service
   - Connect GitHub repo (school-mangment)
   - Name: `school-management-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

3. **Get Backend URL**
   - After deployment, you'll get: `https://school-management-api.onrender.com`

## Frontend API (React + Firebase)

### Update Frontend to use deployed Backend:

In ChatDashboard.jsx, change:
```javascript
const API_URL = 'http://localhost:5001/api';
```

To:
```javascript
const API_URL = 'https://school-management-api.onrender.com/api';
```

### Deployment Steps:

1. **Install Firebase Tools**
   ```
   npm install -g firebase-tools
   ```

2. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Create new project: `school-management`

3. **Initialize Firebase**
   ```
   cd jsx-login-app
   firebase login
   firebase init hosting
   ```

4. **Build & Deploy**
   ```
   npm run build
   firebase deploy
   ```

Your website will be live at: `https://school-management.firebaseapp.com`

## Custom Domain (Optional)

After deployment:
- Firebase Console → Hosting → Add custom domain
- Follow domain verification steps
