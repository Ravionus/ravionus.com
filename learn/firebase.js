// =====================================================
//  firebase.js  —  Ravionus Learn
//  Firebase Auth + Firestore helpers
//  Free Spark plan — no auto-charges possible
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    browserSessionPersistence,
    setPersistence
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// ── Config ────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyDKB1gnAIgVeLHV4Vbs2i8veSntpJ9wLLE",
    authDomain: "ravionus-f5574.firebaseapp.com",
    projectId: "ravionus-f5574",
    storageBucket: "ravionus-f5574.firebasestorage.app",
    messagingSenderId: "701541143903",
    appId: "1:701541143903:web:177af6cbf4cd17927552ea",
    measurementId: "G-MD9EM8X8BK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ── Configure persistence: session-only (clears on browser close) ─
// Store as a promise so signInWithGoogle can await it before redirecting.
const persistenceReady = setPersistence(auth, browserSessionPersistence).catch((err) => {
    console.error('⚠️ Failed to set persistence:', err.code, err.message);
});

// ── Auth error display ────────────────────────────────
// Shows a dismissible banner instead of a blocking alert().
function showAuthError(message) {
    // Remove any existing banner
    document.getElementById('_authErrorBanner')?.remove();
    const banner = document.createElement('div');
    banner.id = '_authErrorBanner';
    banner.style.cssText = [
        'position:fixed', 'top:70px', 'left:50%', 'transform:translateX(-50%)',
        'background:#3b0764', 'color:#f0abfc', 'border:1px solid #7c3aed',
        'padding:12px 20px', 'border-radius:10px', 'font-size:0.9rem',
        'z-index:9999', 'max-width:90vw', 'text-align:center',
        'box-shadow:0 4px 24px rgba(0,0,0,0.5)'
    ].join(';');
    banner.textContent = message;
    const close = document.createElement('button');
    close.textContent = '✕';
    close.style.cssText = 'margin-left:12px;background:none;border:none;color:inherit;cursor:pointer;font-size:1rem;';
    close.onclick = () => banner.remove();
    banner.appendChild(close);
    document.body.appendChild(banner);
    // Auto-dismiss after 8 seconds
    setTimeout(() => banner.remove(), 8000);
}

// ── Auth ──────────────────────────────────────────────

/**
 * Initiate Google Sign-In via redirect.
 * User will be redirected to Google login, then back to the app.
 */
export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        await persistenceReady;
        await signInWithPopup(auth, provider);
        // onAuthStateChanged fires automatically after popup resolves
    } catch (err) {
        console.error('Sign-in error:', err.code, err.message);
        if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
            showAuthError('Sign-in failed. Please try again.');
        }
    }
}

// No-op kept so app.js import doesn't break — popup flow needs no redirect handling
export async function handleAuthRedirect() {}



export async function signOutUser() {
    console.log('🚪 signOutUser() called at', new Date().toISOString());
    try {
        await firebaseSignOut(auth);
        console.log('✅ signOut completed successfully');
    } catch (err) {
        console.error('❌ Sign-out error:', err.code, err.message);
    }
}

export function onAuthChange(callback) {
    onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
    return auth.currentUser;
}

// ── Firestore: Progress ───────────────────────────────

/**
 * Load full progress object for a user from Firestore.
 * Returns null if no data stored yet.
 */
export async function loadProgressFromCloud(uid) {
    try {
        const ref = doc(db, 'users', uid, 'data', 'progress');
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : null;
    } catch (err) {
        console.error('Firestore read error:', err);
        return null;
    }
}

/**
 * Save the full progress object for a user to Firestore.
 */
export async function syncProgressToCloud(uid, progressData) {
    try {
        const ref = doc(db, 'users', uid, 'data', 'progress');
        await setDoc(ref, progressData, { merge: true });
    } catch (err) {
        console.error('Firestore write error:', err);
    }
}

// ── Firestore: Completion Records ─────────────────────

/**
 * Save a completion record (used for verified certificates).
 */
export async function saveCompletion(uid, topicId, topicTitle, score, maxScore) {
    try {
        const ref = doc(db, 'users', uid, 'completions', topicId);
        await setDoc(ref, {
            title: topicTitle,
            topicId,
            score,
            maxScore,
            completedAt: serverTimestamp(),
            certificateId: `${uid.slice(0, 6)}-${topicId}-${Date.now()}`
        });
    } catch (err) {
        console.error('Completion save error:', err);
    }
}
