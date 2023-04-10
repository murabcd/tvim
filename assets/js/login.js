// Add this import
import { signUp, signIn, signInWithGoogle } from "/assets/js/firebase.js";

const signUpForm = document.getElementById("signUpForm");
const signUpEmail = document.getElementById("signUpEmail");
const signUpPassword = document.getElementById("signUpPassword");

const signInForm = document.getElementById("signInForm");
const signInEmail = document.getElementById("signInEmail");
const signInPassword = document.getElementById("signInPassword");

if (signUpForm) {
  signUpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = signUpEmail.value.trim();
    const password = signUpPassword.value.trim();
    signUp(email, password);
  });
}

if (signInForm) {
  signInForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = signInEmail.value.trim();
    const password = signInPassword.value.trim();
    signIn(email, password);
  });
}

// Google Sign-in authentication
const signInWithGoogleButton = document.getElementById("signInWithGoogle");

if (signInWithGoogleButton) {
  signInWithGoogleButton.addEventListener("click", (event) => {
    event.preventDefault();
    signInWithGoogle();
  });
}
