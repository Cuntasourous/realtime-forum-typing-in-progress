import { handleSignup } from "../api/auth-api.js"
import { showToast } from "../app.js"; // Ensure showToast is correctly imported

class LoginView {
  constructor() {
    this.view = `
            <section class="auth-section">
            <h1>Sign Up</h1>
            <form id="signupForm">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                  <div class="form-g">
                    <label for="firstname">First name</label>
                    <input class="form-g--input" type="text" id="firstname" name="firstname" required>
                  </div>
                  <div class="form-g">
                    <label class="form-g--label" for="lastname">Last name</label>
                    <input class="form-g--input" type="text" id="lastname" name="lastname" required>
                  </div>
                </div>  
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="age">Age</label>
                    <input type="number" id="age" name="age" required min="13" max="120">
                </div>
                <div class="form-group">
                    <label for="gender">Gender</label>
                    <select id="gender" name="gender">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-group">
                    <label for="password-rep">Repeat Password</label>
                    <input type="password" id="password-rep" name="password-rep" required>
                </div>
                <button type="submit">Sign Up</button>
            </form>
            </section>
        `;
  }

  render() {
    const root = document.getElementById("root");
    root.innerHTML = this.view;
    this.init();
  }

  init() {
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
      signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
          await handleSignup(event);
        } catch (error) {
          // Display any errors that occur in handleSignup as a toast
          showToast(error.message || "Signup failed. Please try again.");
        }
      });
    }
  }
}


export default LoginView
