import FilterComponent from "./filter.js"
import { handleLogout } from "../api/auth-api.js"

export function updateNavbar() {
  const sessionData = JSON.parse(localStorage.getItem("sessionData"))
  const nav = document.getElementById("nav")
  if (nav) {
    if (sessionData.id === 0) {
      nav.innerHTML = `<!--
            <ul>
                <li><a href="/">Home</a></li>
                <div class="right-nav">
                  <li><a href="/login" id="loginLink">Login</a></li>
                  <li><a href="/signup" id="signupLink">Sign Up</a></li>
                </div>
            </ul> -->
            `
    } else if (sessionData.id !== 0) {
      if (window.location.pathname === "/") {
        nav.innerHTML = `
            <ul>
                <li><a href="/">Home</a></li>
                <!--
                <li><a href="/postform" id="createLink">Create Post</a></li>
                -->
                <!--
                <li><a href="" id="filterLink">Filter</a></li>
                -->
                <!--
                <li class="right"><a href="/logout" id="logoutLink">Logout</a></li>
                -->
                <li class="right username" id="username-p">${sessionData.username}</li>
            </ul>
            `
      } else {
        nav.innerHTML = `
            <ul>
                <li><a href="/">Home</a></li>
                <!--
                <li><a href="/postform" id="createLink">Create Post</a></li>
                -->
                <!--
                <li class="right"><a href="/logout" id="logoutLink">Logout</a></li>
                -->
                <li class="right username" id="username-p">${sessionData.username}</li>
            </ul>
            `
      }
    }
  }

  /* 
      filter
  */
  const filterlink = document.getElementById("filterLink")
  const filterContainer = document.getElementById("filterContainer")
  if (filterContainer) {
    filterContainer.style.display = "none"
  }
  let filterState = false
  if (filterlink) {
    const filterComponent = new FilterComponent()
    filterlink.addEventListener("click", (event) => {
      event.preventDefault()
      if (filterState) {
        console.log("hide filter")
        filterComponent.hideFilter()
        filterState = !filterState
      } else {
        console.log("show filter")
        filterComponent.showFilter()
        filterState = !filterState
      }
    })
  }

  /* 
      logout
  */
  const logoutLink = document.getElementById("logoutLink")
  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      handleLogout(event).then(() => {
        window.app.router.go("/")
      })
    })
  }

  /* 
      username
  */
  const username = document.getElementById("username-p")
  if (username) {
    username.addEventListener("click", (event) => {
      event.preventDefault()
      window.app.router.go("/profile")
    })
  }
}
