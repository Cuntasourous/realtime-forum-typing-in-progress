import { getSession, handleLogin } from "../api/auth-api.js";
import { updateNavbar } from "../components/navbar.js";
import { initWebSocket, closeWebSocket } from "../services/websocket.js";
/* 
    import views "components"
*/
import LoginView from "../components/login.js";
import SignupView from "../components/signup.js";
import MainView from "../components/main.js";
import PostView from "../components/post.js";
import PostFormView from "../components/postform.js";
import ProfileView from "../components/profile.js";
import Chat from "../components/chat.js";

const Router = {
  init: () => {
    Router.go(location.pathname);

    window.addEventListener("popstate", (event) => {
      if (event.state && event.state.route) {
        Router.go(event.state.route, false);
      } else {
        Router.go(location.pathname, false);
      }
    });

    // Prevent default behavior of anchor tags
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (
        target.tagName === "A" &&
        target.href.startsWith(window.location.origin) &&
        target.id !== "filterLink" &&
        target.id !== "logoutLink"
      ) {
        console.log("prevent the link tag elements");
        event.preventDefault();
        const route = target.getAttribute("href");
        Router.go(route);
      }
    });
  },

  go: async (route, addToHistory = true) => {
    console.log(`going to ${route}`);

    /* 
            its like a proxy 
        */
    let sessionData;
    try {
      sessionData = await getSession();
    } catch (err) {
      console.log("error fetching sessionData: ", err);
    }
    const requiresAuth = ["/", "/postform", "/profile"];
    const noAuth = ["/login", "/signup"];
    localStorage.setItem("sessionData", JSON.stringify(sessionData));
    window.app.cUser = sessionData.id;

    if (
      sessionData.id === 0 &&
      (requiresAuth.includes(route) || route.startsWith("/postid="))
    ) {
      route = "/login";
    } else if (sessionData.id !== 0 && noAuth.includes(route)) {
      route = "/";
    }

    // init the websocket connection if the sessionData.id is not 0
    // so the user is logged in
    if (sessionData.id !== 0) {
      console.log("Creating new WebSocket connection");
      window.app.wsConnection = await initWebSocket();
      console.log("New WebSocket connection:", window.app.wsConnection);
    } else {
      console.log("Current WebSocket connection:", window.app.wsConnection);
      if (window.app.wsConnection) {
        closeWebSocket(window.app.wsConnection);
        window.app.wsConnection = null;
      }
    }

    if (addToHistory) {
      history.pushState({ route }, "", route);
    } else {
      history.replaceState({ route }, "", route);
    }

    const root = document.getElementById("root");
    root.innerHTML = "";

    switch (route) {
      case "/":
        const mainView = new MainView();
        break;
      case "/login":
        const loginView = new LoginView();
        loginView.render();
        break;
      case "/signup":
        const signupView = new SignupView();
        signupView.render();
        break;
      case "/postform":
        const postFormView = new PostFormView();
        postFormView.render();
        break;
      case "/profile":
        const profileView = new ProfileView();
        profileView.render();
        break;
      default:
        if (route.startsWith("/postid=")) {
          const paramId = route.substring(route.lastIndexOf("=") + 1);
          console.log(`post id: ${paramId}`);
          const postView = new PostView(paramId);
        } else {
          root.innerHTML = `
          <div class="center-404">
            <h2>404 - Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
          </div>
        `;
        }
        break;
    }

    // update the view (nav bar, chat, etc)
    updateNavbar();
    updateChat();
  },
};

let chatInstance = null;

function updateChat() {
  const sessionData = JSON.parse(localStorage.getItem("sessionData"));
  if (sessionData && sessionData.id !== 0) {
    if (!chatInstance) {
      chatInstance = new Chat();
    }
    chatInstance.render();
  } else {
    chatInstance = null;
    // get the element div with class chat-modal and if exists remove it
    const chatModal = document.querySelector(".chat-modal");
    if (chatModal) {
      chatModal.remove();
    }
    const chatSection = document.getElementById("chat");
    chatSection.style.display = "none";
  }
}

export default Router;
