// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

// Firestore
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Authentication
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCYxZRvhGOSO6KntJKFB8cQdlE5a2XVAaQ",
    authDomain: "moeezland-id.firebaseapp.com",
    projectId: "moeezland-id",
    storageBucket: "moeezland-id.firebasestorage.app",
    messagingSenderId: "979635453691",
    appId: "1:979635453691:web:29d320a19c635972273a5e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app);

// Export

export {

    db,

    auth,

    createUserWithEmailAndPassword,

    signInWithEmailAndPassword,

    signOut,

    onAuthStateChanged,

    reauthenticateWithCredential,

    EmailAuthProvider,

    updatePassword,

    deleteUser,

    collection,

    query,

    where,

    getDocs,

    doc,

    updateDoc,

    runTransaction,

    serverTimestamp

};