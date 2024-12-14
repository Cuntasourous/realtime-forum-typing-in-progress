import { handleUser } from "../api/data-api.js"

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
                  ${this.getInitials(userInfo.firstname, userInfo.lastname)}
                </div>
                <h2>${userInfo.username}</h2>
              </div>
              <div class="profile-info">
                <div class="info-row">
                  <span class="label">Email</span>
                  <span class="value">${userInfo.email}</span>
                </div>
                <div class="info-row">
                  <span class="label">First Name</span>
                  <span class="value">${userInfo.firstname}</span>
                </div>
                <div class="info-row">
                  <span class="label">Last Name</span>
                  <span class="value">${userInfo.lastname}</span>
                </div>
                <div class="info-row">
                  <span class="label">Age</span>
                  <span class="value">${userInfo.age}</span>
                </div>
                <div class="info-row">
                  <span class="label">Gender</span>
                  <span class="value">${userInfo.gender}</span>
                </div>
                <a href="/logout" id="logoutLink">Logout</a>
              </div>
            </div>
          </div>
        `
      })
      .catch((err) => {
        console.log(err)
      })
  }

  init() {}
}

export default ProfileView
