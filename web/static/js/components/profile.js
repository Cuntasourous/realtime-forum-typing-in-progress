import { handleUser } from "../api/data-api.js"
import { handleLogout } from "../api/auth-api.js"

  const logoutLink = document.getElementById("logoutLink")
  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      handleLogout(event).then(() => {
        window.app.router.go("/")
      })
    })
  }
class ProfileView {
  constructor() {
    this.sessionData = JSON.parse(localStorage.getItem("sessionData"))
    this.userId = this.sessionData.id
    this.username = this.sessionData.username
    this.view = `
        <h1>${this.username} Profile page</h1>
    `
  }

  getInitials(firstName, lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  render() {
    const root = document.getElementById("root")
    handleUser(this.userId)
      .then((userInfo) => {
        root.innerHTML = `
          <div class="profile-container">
            <div class="profile-card">
              <div class="profile-header">
                <div class="profile-avatar">
                <img src="/static/images/pfp.png" alt="pfp image" class="pfp-img" width="150px" height="150px">
                </div>
                <h2>${userInfo.username}</h2>
                <p>${userInfo.email}</p>
                <br>
                <h4>FULL NAME</h4>
                <p>${userInfo.firstname} ${userInfo.lastname}</p>
                                <br>
                <h4>AGE</h4>
                <p>${userInfo.age}</p>
                                <br>
                <h4>GENDER</h4>
                <p>${userInfo.gender}</p>
                <br>
                <!--
                <a href="/logout" id="logoutLink">Logout</a>
                -->
              </div>
              </div>
            </div>
          </div>
        `
      })
      .catch((err) => {
        console.log(err)
      })

      // Hide the existing banner
      const banner = document.querySelector(".banner");
      if (banner) {
        banner.style.display = "none";
      }

          // Hide the chat element
    const chat = document.getElementById("chat");
    if (chat) {
      chat.style.display = "none"; // Hide the chat element
    }

  }
  

  init() {}
}

export default ProfileView
