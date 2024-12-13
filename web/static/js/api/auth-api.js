import { showToast } from "../app.js"; // Ensure showToast is correctly imported

const LOGINURL = "http://localhost:8080/api/login";
const SIGNUPURL = "http://localhost:8080/api/signup";
const LOGOUTURL = "http://localhost:8080/api/logout";
const SESSIONURL = "http://localhost:8080/api/session";

export async function handleLogin(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const formDataObject = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(LOGINURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formDataObject),
    });

    const result = await response.json();

    if (response.ok) {
      window.location.href = "/";
    } else {
      const errorMessage = result.message || "Login failed. Please try again.";
      showToast(errorMessage);
    }
  } catch (error) {
    showToast("An unexpected error occurred. Please try again later.");
  }
}

export async function handleSignup(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const formDataObject = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(SIGNUPURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formDataObject),
    });

    const result = await response.json();

    if (response.ok) {
      window.location.href = "/";
    } else {
      const errorMessage = result.message || "Signup failed. Please check your details and try again.";
      showToast(errorMessage);
    }
  } catch (error) {
    showToast("An unexpected error occurred. Please try again later.");
  }
}

export async function handleLogout(event) {
  event.preventDefault();

  try {
    const response = await fetch(LOGOUTURL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (response.ok) {
      window.location.href = "/";
    } else {
      showToast(result.message || "Logout failed. Please try again.");
    }
  } catch (error) {
    showToast("An unexpected error occurred. Please try again later.");
  }
}

export async function getSession() {
  try {
    const response = await fetch(SESSIONURL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (response.ok) {
      return result.data;
    } else {
      showToast("Unable to retrieve session. Please try again.");
      return null;
    }
  } catch (error) {
    showToast("An unexpected error occurred while retrieving session.");
    return null;
  }
}
