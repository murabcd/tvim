import {
  auth,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  uploadAvatar,
} from "/assets/js/firebase.js";

const updateProfileForm = document.getElementById("updateProfileForm");
const displayName = document.getElementById("displayName");
const email = document.getElementById("email");
const password = document.getElementById("password");
const avatar = document.getElementById("avatar");

if (updateProfileForm) {
  updateProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const displayNameValue = displayName.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const avatarFile = avatar.files[0];

    if (avatarFile) {
      await uploadAvatar(avatarFile);
    }

    if (displayNameValue) {
      await updateUserProfile(displayNameValue);
    }

    if (emailValue) {
      await updateUserEmail(emailValue);
    }

    if (passwordValue) {
      await updateUserPassword(passwordValue);
    }
  });
}
