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
  toast.style.display = "block";

  // Hide toast after 3 seconds
  setTimeout(() => {
      toast.style.display = "none";
  }, 3000);
}

