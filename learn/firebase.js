// =====================================================
//  firebase.js  —  Ravionus Learn
//  Firebase Auth + Firestore helpers
//  Free Spark plan — no auto-charges possible
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    signOut as firebaseSignOut,
    onAuthStateChanged
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

// ── Auth ──────────────────────────────────────────────

/**
 * Initiate Google Sign-In via redirect.
 * User will be redirected to Google login, then back to the app.
 */
export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithRedirect(auth, provider);
        // Page will redirect to Google, then back to here
        console.log('🔄 Redirecting to Google login...');
    } catch (err) {
        console.error('❌ Sign-in error:', err.code, err.message);
        alert(`Sign-in failed: ${err.message}`);
    }
}

/**
 * Handle the redirect result after returning from Google login.
 * Called on page load to complete the auth flow.
 */
export async function handleAuthRedirect() {
    try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
            console.log('✅ Signed in via redirect:', result.user.displayName);
        }
    } catch (err) {
        console.error('❌ Redirect result error:', err.code, err.message);
    }
}



export async function signOutUser() {
    await firebaseSignOut(auth);
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
