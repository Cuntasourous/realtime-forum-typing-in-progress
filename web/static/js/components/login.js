import { handleLogin } from "../api/auth-api.js";
import { showToast } from "../app.js"; // Ensure showToast is correctly imported

class LoginView {
  constructor() {
    this.view = `
            <section class="auth-section">
                <h1>Login</h1>
                <form id="loginform">
                    <div class="form-group">
                        <label for="username_email">Username/Email</label>
                        <input type="text" id="username_email" name="username_email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit">Login</button>
                    <p>Don't have an account? <a href="/signup">Sign Up</a></p>
                </form>
            </section>
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
