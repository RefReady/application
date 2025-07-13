# Firebase Setup Instructions for RefReady

This guide will walk you through setting up Firebase for the RefReady application.

## 📋 Prerequisites

- Google account
- Web browser
- Basic understanding of Firebase

## 🚀 Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project"
   - Enter project name: `refready-app` (or your preferred name)
   - Choose whether to enable Google Analytics (recommended)
   - Click "Create project"

## 🔧 Step 2: Enable Authentication

1. **Navigate to Authentication**
   - In the Firebase console, click "Authentication" in the left sidebar
   - Click "Get started"

2. **Configure Sign-in Methods**
   - Go to "Sign-in method" tab
   - Enable "Email/Password"
   - Click "Save"

3. **Set Up Authorization Domains**
   - In "Settings" tab, add your domain to "Authorized domains"
   - For local development, `localhost` should already be included

## 🗄️ Step 3: Set Up Cloud Firestore

1. **Create Firestore Database**
   - Click "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" (we'll secure it later)
   - Select your preferred location
   - Click "Done"

2. **Set Up Security Rules** 
   - Go to "Rules" tab
   - Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Club members can access their club data
    match /clubs/{clubId} {
      allow read, write: if request.auth != null && 
        resource.data.members[request.auth.uid] != null;
    }
    
    // Safety alerts accessible by club members
    match /safetyAlerts/{alertId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/clubs/$(resource.data.clubId)).data.members[request.auth.uid] != null;
    }
  }
}
```

## ⚙️ Step 4: Get Firebase Configuration

1. **Add Web App**
   - Click the settings gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"
   - Scroll down to "Your apps" section
   - Click the web icon `</>`
   - Enter app nickname: "RefReady Web App"
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

2. **Copy Configuration**
   - Copy the Firebase config object that appears
   - It should look like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 🔄 Step 5: Update Configuration File

1. **Edit firebase-config.js**
   - Open `website/firebase-config.js`
   - Replace the demo configuration with your actual Firebase config:

```javascript
// Replace this section:
const firebaseConfig = {
    apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "refready-demo.firebaseapp.com",
    projectId: "refready-demo",
    storageBucket: "refready-demo.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:xxxxxxxxxxxxxxxxxx"
};

// With your actual configuration:
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

## 🧪 Step 6: Test the Setup

1. **Start Local Server**
   ```bash
   # Using Python (if installed)
   python -m http.server 8000
   
   # Or using Node.js (if installed)
   npx http-server
   
   # Or using VS Code Live Server extension
   ```

2. **Test Authentication**
   - Navigate to `http://localhost:8000/website/dashboard/login.html`
   - Click "View Demo Dashboard"
   - This should create a demo account and log you in
   - Check the browser console for any errors

3. **Verify Database Creation**
   - Go back to Firebase Console > Firestore Database
   - You should see new collections: `users`, `clubs`
   - The demo data should be populated

## 🔐 Step 7: Set Up Production Security (Optional)

### Enhanced Firestore Rules
Replace test rules with production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function hasRole(role) {
      return isAuthenticated() && getUserData().role == role;
    }
    
    function isClubMember(clubId) {
      return isAuthenticated() && getUserData().clubId == clubId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && 
        (request.auth.uid == userId || hasRole('admin'));
      allow write: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated();
    }
    
    // Clubs collection
    match /clubs/{clubId} {
      allow read: if isClubMember(clubId) || hasRole('admin');
      allow write: if (isClubMember(clubId) && hasRole('coordinator')) || hasRole('admin');
    }
    
    // Safety alerts
    match /safetyAlerts/{alertId} {
      allow read, write: if isClubMember(resource.data.clubId) || hasRole('admin');
      allow create: if isAuthenticated();
    }
  }
}
```

### Authentication Settings
1. **Enable Email Verification** (optional)
   - Go to Authentication > Templates
   - Customize email verification template
   - In Authentication > Settings, enable "Email enumeration protection"

2. **Set Password Requirements**
   - Go to Authentication > Settings
   - Configure password policy (minimum length, complexity)

## 📱 Step 8: Optional - Enable Additional Features

### Push Notifications (Firebase Messaging)
1. Go to Project Settings > Cloud Messaging
2. Generate a new key pair for VAPID
3. Update your web app manifest with the VAPID key

### Analytics (Google Analytics)
1. Go to Project Settings > Integrations
2. Link to Google Analytics (if not done during project creation)

## 🚨 Troubleshooting

### Common Issues

**Error: "Firebase config not found"**
- Ensure you've replaced the demo config with your actual Firebase config
- Check that all required fields are present

**Error: "Permission denied"**
- Check Firestore security rules
- Ensure user is authenticated before accessing data
- Verify user has correct role permissions

**Error: "Auth domain not authorized"**
- Add your domain to Firebase Console > Authentication > Settings > Authorized domains

**Error: "Module not found"**
- Ensure you're serving the files from a web server (not file://)
- Check that all file paths are correct

### Debug Mode
To enable Firebase debug mode, add to console:
```javascript
firebase.firestore().enableNetwork();
firebase.firestore().settings({ host: 'localhost:8080', ssl: false });
```

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Authentication enabled with Email/Password
- [ ] Firestore database created
- [ ] Security rules configured
- [ ] Configuration updated in `firebase-config.js`
- [ ] Local server running
- [ ] Demo login working
- [ ] Database collections created
- [ ] No console errors

## 🎯 What's Next?

After completing this setup:

1. **Test all authentication flows** (login, logout, password reset)
2. **Create real user accounts** for your club administrators
3. **Populate initial club data** through the dashboard
4. **Test real-time updates** between multiple browser tabs
5. **Deploy to production hosting** (Firebase Hosting, Vercel, etc.)

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify Firebase Console shows the correct project structure
3. Test with demo credentials first before creating custom accounts
4. Review Firebase documentation for specific features

Your RefReady application should now be fully functional with Firebase backend! 🎉 