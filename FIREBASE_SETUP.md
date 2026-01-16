# Firebase Setup Guide

## Step 1: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project (or create a new one)
3. Click the gear icon → Project Settings
4. Scroll down to "Your apps" section
5. Click the web icon `</>` to add a web app (if not already added)
6. Copy the configuration values

## Step 2: Enable Firebase Services

### Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Enable **Email/Password** provider
5. Click "Save"

### Enable Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode**
4. Select a location (choose closest to your users)
5. Click "Enable"

### Set Firestore Security Rules
1. Go to Firestore Database → Rules tab
2. Replace with these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

## Step 3: Create Local Environment File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## Step 4: Configure Netlify Environment Variables

1. Go to your Netlify dashboard
2. Select your Strat-O-Matic project
3. Go to **Site settings** → **Environment variables**
4. Add each variable (same names as in .env):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

5. Click "Save"
6. Trigger a new deploy

## Step 5: Test Locally

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:5173/login
3. Create a new account
4. Verify you can log in and access the app

## Step 6: Deploy

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Add Firebase authentication"
   git push
   ```

2. Netlify will automatically deploy
3. Test the live site with login/signup

## What's Implemented

- ✅ Firebase Authentication (Email/Password)
- ✅ Login/Signup UI
- ✅ Protected routes (requires login)
- ✅ Logout functionality
- ✅ User email display in navigation
- ⏳ Firestore data sync (next step)

## Next Steps

After authentication is working, we'll update the data hooks to:
- Save hitters, pitchers, ballparks, and teams to Firestore
- Sync data across all devices where you're logged in
- Keep data private to each user account
