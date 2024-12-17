import Router from "./services/router.js"
import { handleCategories } from "./api/data-api.js"
import state from "./services/state.js"

window.app = {}
app.router = Router
app.wsConnection = null
app.cUser = null

window.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded")
  handleCategories().then((categories) => {
    state.setCategories(categories)
  })

  app.router.init()
})

export function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  toastMessage.textContent = message;

  // Reset styles to start animation
  toast.style.display = "block"; // Make it visible first
  toast.classList.remove("fade-out"); // Ensure fade-out class is removed

  // Set a timeout to trigger fade-out after 3 seconds
  setTimeout(() => {
      toast.classList.add("fade-out"); // Add class to trigger fade-out
  }, 3000); // Duration toast stays visible

  // Hide toast completely after the animation ends
  setTimeout(() => {
      toast.style.display = "none"; // Hide the toast from the DOM
  }, 3500); // Match this duration to the CSS transition time
}
