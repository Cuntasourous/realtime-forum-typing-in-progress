import { handleSignup } from "../api/auth-api.js"
import { showToast } from "../app.js"; // Ensure showToast is correctly imported

class LoginView {
  constructor() {
    this.view = `
              <div class="flex2"><!--
            <div class="banner2">
            
                <img src="/static/images/LOGO.png" width="100px" height="auto" alt="logo"/>
                
            </div>-->
            <section class="auth-section">
            <h1>Create An Account</h1>
            <form id="signupForm">
                <div class="form-group">
                    <input type="text" id="username" name="username" placeholder="Username" required>
                </div>
                <div class="form-group">
                    <input type="email" id="email" placeholder="Email Address" name="email" required>
                </div>
                <div class="form-group">
                  <div class="form-g">
                    <input class="form-g--input" type="text" id="firstname" placeholder="First Name" name="firstname" required>
                  </div>
                  <div class="form-g">
                    <input class="form-g--input" type="text" id="lastname" placeholder="Last Name" name="lastname" required>
                  </div>
                </div>  
                <div class="form-group">
                    <input type="number" id="age" name="age" placeholder="Age" required min="13" max="120">
                </div>
                <div class="form-group">
                    <select id="gender" name="gender">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div class="form-group">
                    <input type="password" id="password" name="password" placeholder="Password" required>
                </div>
                <div class="form-group">
                    <input type="password" id="password-rep" name="password-rep" placeholder="Repeat Password" required>
                </div>
                <button type="submit">Sign Up</button>
                <p>Already have an account? <a href="/login">Login</a></p>
            </form>
            </section>
            </div>
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
          alert("signup failed. Try again")
          showToast(error.message || "Signup failed. Please try again.");
        }
      });
    }
  }
}


export default LoginView
