# Switch to Real Firebase

Your RefReady dashboard is currently running in **DEMO MODE** with mock data. When you're ready to use real Firebase, follow these steps:

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `refready-dashboard`
4. Continue through setup (disable Google Analytics if you don't need it)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. Enable **Email/Password** provider
4. Click **Save**

## Step 3: Enable Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (you can secure it later)
3. Select your preferred location
4. Click **Done**

## Step 4: Get Your Config

1. Go to **Project Settings** (gear icon ⚙️)
2. Scroll to **Your apps** section
3. Click **Web** icon (`</>`)
4. Enter app name: `RefReady Dashboard`
5. Copy the config object that appears

## Step 5: Update Your Code

1. Open `website/firebase-config.js`
2. Find the line: `const DEMO_MODE = true;`
3. Change it to: `const DEMO_MODE = false;`
4. Replace the demo config with your real Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Step 6: Create Your First User

1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Create admin account with email/password
4. Your dashboard will now use real Firebase data!

## Security (Important!)

After switching to real Firebase, update your Firestore security rules in the Firebase Console under **Firestore Database** → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Club data accessible to club members
    match /clubs/{clubId} {
      allow read, write: if request.auth != null;
    }
    
    // Safety alerts accessible to coordinators and mentors
    match /safetyAlerts/{alertId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Demo Credentials (Current)

While in demo mode, you can log in with:
- **Admin**: admin@refready.com / admin123
- **Club**: club@refready.com / club123  
- **Mentor**: mentor@refready.com / mentor123
- **Referee**: referee@refready.com / referee123

---

Need help? Check the [Firebase Documentation](https://firebase.google.com/docs) or the original `FIREBASE_SETUP.md` file. 