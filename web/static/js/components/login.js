import { handleLogin } from "../api/auth-api.js";
import { showToast } from "../app.js"; // Ensure showToast is correctly imported

class LoginView {
  constructor() {
    this.view = `
          <div class="flex">
            <div class="banner">
                <img src="/static/images/LOGO.png" width="150px" height="auto" alt="logo"/>
            </div>
            <section class="auth-section">
                <h1>Enter Account</h1>
                <form id="loginform">
                    <div class="form-group">
                        <input type="text" id="username_email" name="username_email" placeholder="Username" required>
                    </div>
                    <div class="form-group">
                        <input type="password" id="password" name="password" placeholder="Password" required>
                    </div>
                    <button type="submit">Log In</button>
                    <p>Don't have an account? <a href="/signup">Sign Up</a></p>
                </form>
            </section>
          </div>
        `;
  }

  render() {
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = this.view;
    }
    this.init();
  }

  init() {
    const loginForm = document.getElementById("loginform");
    if (loginForm) {
      loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
          await handleLogin(event);
        } catch (error) {
          // Display any errors that occur in handleLogin as a toast
          showToast(error.message || "Login failed. Please try again.");
        }
      });
    }
  }
}

export default LoginView;
