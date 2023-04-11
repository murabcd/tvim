import { auth } from "./firebase.js";

auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, allow access to the current page.
  } else {
    // No user is signed in, redirect to index.html.
    window.location.href = "/index.html";
  }
});
