// Firebase Configuration
// ======================
// 
// TO USE WITH REAL FIREBASE:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project
// 3. Enable Authentication (Email/Password)
// 4. Enable Firestore Database
// 5. Get your config from Project Settings > Your apps
// 6. Replace the DEMO_MODE config below with your real config
// 7. Set DEMO_MODE = false

const DEMO_MODE = false;

// REAL FIREBASE CONFIG - Production ready
const firebaseConfig = {
  apiKey: "AIzaSyC0CQqxMZioRfap6ZAf7WSZ5taWajXP1Ro",
  authDomain: "refready-app.firebaseapp.com",
  projectId: "refready-app",
  storageBucket: "refready-app.firebasestorage.app",
  messagingSenderId: "395077428999",
  appId: "1:395077428999:web:f85ec868d57e160ec207a2",
  measurementId: "G-0EGTEL3VXL"
};

// REAL CONFIG - Paste your Firebase config here and set DEMO_MODE = false
/*
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
*/

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where, orderBy, limit, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Authentication functions
export const authFunctions = {
    // Sign in with email and password
    signIn: async (email, password) => {
        if (DEMO_MODE) {
            // Demo mode - simulate successful login
            const demoUsers = {
                'admin@refready.com': { uid: 'demo-admin', email: 'admin@refready.com', role: 'admin' },
                'club@refready.com': { uid: 'demo-club', email: 'club@refready.com', role: 'coordinator' },
                'mentor@refready.com': { uid: 'demo-mentor', email: 'mentor@refready.com', role: 'mentor' },
                'referee@refready.com': { uid: 'demo-referee', email: 'referee@refready.com', role: 'referee' }
            };
            
            const validPasswords = ['admin123', 'club123', 'mentor123', 'referee123'];
            
            if (demoUsers[email] && validPasswords.includes(password)) {
                // Store demo user in localStorage for session
                localStorage.setItem('demoUser', JSON.stringify(demoUsers[email]));
                return { success: true, user: demoUsers[email] };
            } else {
                return { success: false, error: 'Invalid demo credentials' };
            }
        }
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Create new user account
    signUp: async (email, password, userData) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update display name
            if (userData.displayName) {
                await updateProfile(user, { displayName: userData.displayName });
            }

            // Create user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: userData.displayName || '',
                role: userData.role || 'referee',
                clubId: userData.clubId || null,
                createdAt: serverTimestamp(),
                isActive: true,
                profile: {
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    phone: userData.phone || '',
                    age: userData.age || null,
                    experience: userData.experience || 'newcomer'
                }
            });

            return { success: true, user: user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Sign out
    signOut: async () => {
        if (DEMO_MODE) {
            // Demo mode - clear localStorage
            localStorage.removeItem('demoUser');
            return { success: true };
        }
        
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Reset password
    resetPassword: async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Auth state listener
    onAuthStateChanged: (callback) => {
        if (DEMO_MODE) {
            // Demo mode - check localStorage for demo user
            const demoUser = localStorage.getItem('demoUser');
            if (demoUser) {
                callback(JSON.parse(demoUser));
            } else {
                callback(null);
            }
            return () => {}; // Return empty unsubscribe function
        }
        
        return onAuthStateChanged(auth, callback);
    }
};

// Database functions
export const dbFunctions = {
    // Club functions
    createClub: async (clubData) => {
        try {
            const docRef = await addDoc(collection(db, 'clubs'), {
                ...clubData,
                createdAt: serverTimestamp(),
                isActive: true
            });
            return { success: true, clubId: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    getClub: async (clubId) => {
        try {
            const docSnap = await getDoc(doc(db, 'clubs', clubId));
            if (docSnap.exists()) {
                return { success: true, club: { id: docSnap.id, ...docSnap.data() } };
            } else {
                return { success: false, error: 'Club not found' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    updateClub: async (clubId, updateData) => {
        try {
            await updateDoc(doc(db, 'clubs', clubId), {
                ...updateData,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // User functions
    getUser: async (userId) => {
        try {
            const docSnap = await getDoc(doc(db, 'users', userId));
            if (docSnap.exists()) {
                return { success: true, user: { id: docSnap.id, ...docSnap.data() } };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    updateUser: async (userId, updateData) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                ...updateData,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get users by club and role
    getClubUsers: async (clubId, role = null) => {
        try {
            let q = query(collection(db, 'users'), where('clubId', '==', clubId), where('isActive', '==', true));
            if (role) {
                q = query(q, where('role', '==', role));
            }
            
            const querySnapshot = await getDocs(q);
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, users };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Safety alerts functions
    createSafetyAlert: async (alertData) => {
        try {
            const docRef = await addDoc(collection(db, 'safetyAlerts'), {
                ...alertData,
                createdAt: serverTimestamp(),
                status: 'active'
            });
            return { success: true, alertId: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    getSafetyAlerts: async (clubId) => {
        try {
            const q = query(
                collection(db, 'safetyAlerts'), 
                where('clubId', '==', clubId),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const alerts = [];
            querySnapshot.forEach((doc) => {
                alerts.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, alerts };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    updateSafetyAlert: async (alertId, updateData) => {
        try {
            await updateDoc(doc(db, 'safetyAlerts', alertId), {
                ...updateData,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Real-time listeners
    listenToClubUsers: (clubId, callback) => {
        const q = query(collection(db, 'users'), where('clubId', '==', clubId), where('isActive', '==', true));
        return onSnapshot(q, (querySnapshot) => {
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
            callback(users);
        });
    },

    listenToSafetyAlerts: (clubId, callback) => {
        const q = query(
            collection(db, 'safetyAlerts'), 
            where('clubId', '==', clubId),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (querySnapshot) => {
            const alerts = [];
            querySnapshot.forEach((doc) => {
                alerts.push({ id: doc.id, ...doc.data() });
            });
            callback(alerts);
        });
    }
};

// Utility functions
export const utils = {
    // Get current user's club ID
    getCurrentUserClubId: async () => {
        const user = auth.currentUser;
        if (!user) return null;
        
        const userDoc = await dbFunctions.getUser(user.uid);
        return userDoc.success ? userDoc.user.clubId : null;
    },

    // Check if user has role
    hasRole: async (requiredRole) => {
        const user = auth.currentUser;
        if (!user) return false;
        
        const userDoc = await dbFunctions.getUser(user.uid);
        if (!userDoc.success) return false;
        
        const userRole = userDoc.user.role;
        
        // Define role hierarchy
        const roleHierarchy = {
            'admin': ['admin', 'coordinator', 'mentor', 'referee'],
            'coordinator': ['coordinator', 'mentor', 'referee'],
            'mentor': ['mentor', 'referee'],
            'referee': ['referee']
        };
        
        return roleHierarchy[userRole]?.includes(requiredRole) || false;
    },

    // Format timestamp
    formatTimestamp: (timestamp) => {
        if (!timestamp) return 'Unknown';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    }
};

// Initialize demo data (run once)
export const initializeDemoData = async () => {
    try {
        // Create demo club
        const clubResult = await dbFunctions.createClub({
            name: 'Riverside Netball Club',
            type: 'community',
            sport: 'netball',
            code: 'RNC2024',
            contact: {
                name: 'Sarah Mitchell',
                email: 'admin@riversidenetball.com',
                phone: '+61 8 1234 5678',
                address: '123 Sports Complex Drive\nAdelaide SA 5000\nAustralia'
            }
        });

        if (clubResult.success) {
            console.log('Demo club created:', clubResult.clubId);
            return clubResult.clubId;
        }
    } catch (error) {
        console.error('Error initializing demo data:', error);
    }
};

console.log('Firebase initialized successfully'); 