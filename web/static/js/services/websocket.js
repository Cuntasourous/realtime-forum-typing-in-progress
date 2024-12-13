export function initWebSocket() {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://${window.location.host}/ws`)

    ws.onopen = () => {
      console.log("WebSocket connection established")
      localStorage.setItem("wsState", ws.readyState)
      resolve(ws) // This returns the WebSocket instance
    }

    ws.onmessage = (event) => {
      console.log("Message received:", event.data)
      const message = JSON.parse(event.data)
      if (message.type === "active_users") {
        let sessionData = JSON.parse(localStorage.getItem("sessionData"))
        let cUserId = sessionData.id
        let activeUsers = message.content.filter((userId) => userId !== cUserId)
        localStorage.setItem("activeUsers", JSON.stringify(activeUsers))
        window.dispatchEvent(
          new CustomEvent("activeUsersUpdated", {
            detail: activeUsers,
          })
        )
      } else if (message.type === "chat_message") {
        window.dispatchEvent(
          new CustomEvent("chatMessageReceived", {
            detail: message,
          })
        )
      }
    }
  })
}

export function closeWebSocket(ws) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log("closing websocket")
    ws.close(1000, "User logged out")
    localStorage.removeItem("wsState")
    localStorage.removeItem("activeUsers")
  }
}
