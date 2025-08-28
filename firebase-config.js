// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA0Sw8STec1LHuFN9_fxN7ni506TrD51hs",
    authDomain: "boolean-gold.firebaseapp.com",
    projectId: "boolean-gold",
    storageBucket: "boolean-gold.firebasestorage.app",
    messagingSenderId: "137254251529",
    appId: "1:137254251529:web:ced755c0e98a7bb05a5cd8",
    measurementId: "G-XR8356J2YE"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// Initialize Firebase services
let auth, db;
try {
    auth = firebase.auth();
    db = firebase.firestore();
    console.log('Firebase services initialized');
} catch (error) {
    console.error('Firebase services initialization error:', error);
}

// Initialize Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Authentication state observer
if (auth) {
    auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? 'User signed in' : 'User signed out');
    
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.email);
        
        // Store user details in localStorage
        const userDetails = {
            uid: user.uid,
            name: user.displayName || user.email || 'Guest User',
            email: user.email || 'guest@boolean.local',
            photo: user.photoURL,
            isGuest: !user.email
        };
        localStorage.setItem('user', JSON.stringify(userDetails));
        
        // Hide auth gate and show main app
        const authGate = document.getElementById('authGate');
        const mainApp = document.getElementById('mainApp');
        
        if (authGate) {
            authGate.classList.add('hidden');
            console.log('Auth gate hidden');
        }
        if (mainApp) {
            mainApp.classList.add('visible');
            console.log('Main app made visible');
        }
        
        // Initialize app if not already done
        if (typeof initializeApp === 'function') {
            console.log('Initializing app...');
            initializeApp();
        }
    } else {
        // User is signed out
        console.log('User is signed out');
        
        // Clear user from localStorage
        localStorage.removeItem('user');
        
        // Show auth gate and hide main app
        const authGate = document.getElementById('authGate');
        const mainApp = document.getElementById('mainApp');
        
        if (authGate) {
            authGate.classList.remove('hidden');
            console.log('Auth gate shown');
        }
        if (mainApp) {
            mainApp.classList.remove('visible');
            console.log('Main app hidden');
        }
    }
    });
}

// Guest sign in function
async function signInAsGuest() {
    if (!auth) {
        return { success: false, error: 'Firebase Auth not available' };
    }
    try {
        const result = await auth.signInAnonymously();
        console.log('Signed in as guest successfully');
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Guest sign in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign in function
async function signIn(email, password) {
    if (!auth) {
        return { success: false, error: 'Firebase Auth not available' };
    }
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Signed in successfully');
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign up function
async function signUp(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('Signed up successfully');
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}

// Sign out function
async function signOut() {
    try {
        await auth.signOut();
        console.log('Signed out successfully');
        
        // Clear user from localStorage
        localStorage.removeItem('user');
        
        // Show auth gate and hide main app
        const authGate = document.getElementById('authGate');
        const mainApp = document.getElementById('mainApp');
        
        if (authGate) authGate.classList.remove('hidden');
        if (mainApp) mainApp.classList.remove('visible');
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

// Password reset function
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        console.log('Password reset email sent');
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
    }
}

// Google sign in function
async function signInWithGoogle() {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        console.log('Signed in with Google successfully');
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Google sign in error:', error);
        return { success: false, error: error.message };
    }
}

// Get current user function
function getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
        return {
            uid: user.uid,
            name: user.displayName || user.email || 'Guest User',
            email: user.email || 'guest@boolean.local',
            photo: user.photoURL,
            isGuest: !user.email
        };
    }
    return null;
}

// Export functions for use in main script
window.firebaseAuth = {
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
    signInAsGuest,
    auth,
    getCurrentUser
}; 