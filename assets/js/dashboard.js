import { auth } from "/assets/js/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
      console.log("Sign out successful");
      window.location.href = "/signin.html";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  });
}
