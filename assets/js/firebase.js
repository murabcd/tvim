import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAuYCI-WOOcapTLKibEev2cXo1SC8lz8k",
  authDomain: "todos-327f8.firebaseapp.com",
  projectId: "todos-327f8",
  storageBucket: "todos-327f8.appspot.com",
  messagingSenderId: "165133808503",
  appId: "1:165133808503:web:3fbc3f87c51a43d4c2a772",
  measurementId: "G-R4YFQCG4R2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function signUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("Sign up successful, user:", user);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log("Sign up error:", errorCode, errorMessage);
  }
}

// Email authentication

async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("Sign in successful, user:", user);
    // Redirect to the dashboard page
    window.location.href = "/pages/dashboard.html";
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log("Sign in error:", errorCode, errorMessage);
  }
}

// Google Sign-In authentication

async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    console.log("Sign in with Google successful, user:", user);
    // Redirect to the dashboard page
    window.location.href = "/pages/dashboard.html";
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log("Sign in with Google error:", errorCode, errorMessage);
  }
}

// Update user's display name
async function updateUserProfile(displayName) {
  try {
    await updateProfile(auth.currentUser, { displayName });
    console.log("Display name updated successfully");
  } catch (error) {
    console.log("Error updating display name:", error);
  }
}

// Update user's email
async function updateUserEmail(newEmail) {
  try {
    await updateEmail(auth.currentUser, newEmail);
    console.log("Email updated successfully");
  } catch (error) {
    console.log("Error updating email:", error);
  }
}

// Update user's password
async function updateUserPassword(newPassword) {
  try {
    await updatePassword(auth.currentUser, newPassword);
    console.log("Password updated successfully");
  } catch (error) {
    console.log("Error updating password:", error);
  }
}

// Upload user's avatar
async function uploadAvatar(file) {
  // Add your logic to upload the avatar file, e.g., to Firebase Storage
  console.log("Uploading avatar:", file);
}

export {
  auth,
  signUp,
  signIn,
  signInWithGoogle,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  uploadAvatar,
};
