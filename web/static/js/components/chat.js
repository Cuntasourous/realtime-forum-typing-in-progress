import { handleUsers, handleMessage, getChatOrder } from "../api/data-api.js"
import {
  getNotifications,
  deleteNotification,
  addNotification,
} from "../api/notification-api.js"
import { showToast } from "../app.js"

class Chat {
  constructor() {
    this.users = []
    this.allUsers = {}
    this.activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || []
    this.userOrder = JSON.parse(localStorage.getItem("userOrder")) || []
    this.init()
    this.loadInitialNotifications()
    this.loadInitialOrder()
  }

  async loadInitialOrder() {
    try {
      const orders = await getChatOrder(window.app.cUser)
      if (orders) {
        // this.userOrder = orders.map(n => n.sender_id)
        this.userOrder = orders
        localStorage.setItem("userOrder", JSON.stringify(this.userOrder))
      }
    } catch (error) {
      showToast("Failed to load chat order")
    }
  }

  async loadInitialNotifications() {
    try {
      const notifications = await getNotifications(window.app.cUser)
      if (notifications) {
        this.updateNotificationBadges(notifications)
        this.userOrder = notifications.map(n => n.sender_id)
        localStorage.setItem("userOrder", JSON.stringify(this.userOrder))
      }
    } catch (error) {
      showToast("Failed to load notifications")
    }
  }

  updateNotificationBadges(notifications) {
    const notificationCount = {}
    notifications.forEach((notification) => {
      notificationCount[notification.sender_id] =
        (notificationCount[notification.sender_id] || 0) + 1
    })

    Object.entries(notificationCount).forEach(([senderId, count]) => {
      this.updateNotificationBadge(parseInt(senderId), count)
    })
  }

  updateNotificationBadge(userId, count) {
    const userItem = document.querySelector(
      `.user-item[data-userid="${userId}"]`
    )
    if (userItem) {
      let badge = userItem.querySelector(".unread-badge")
      if (count > 0) {
        if (!badge) {
          badge = document.createElement("span")
          badge.className = "unread-badge"
          userItem.appendChild(badge)
        }
        badge.textContent = count
      } else if (badge) {
        badge.remove()
      }
    }
  }

  async renderUsers() {
    try {
      const users = await handleUsers()
      this.allUsers = users
      this.users = this.activeUsers.map((userId) => {
        let activeUser = this.allUsers.find((user) => user.id === userId)
        return {
          id: activeUser.id,
          username: activeUser.username,
          active: true,
        }
      })

      let offlineUsers = this.allUsers.filter(
        (user) =>
          !this.activeUsers.includes(user.id) &&
          user.id !== parseInt(window.app.cUser)
      )

      this.users = this.users.concat(
        offlineUsers.map((user) => ({
          id: user.id,
          username: user.username,
          active: false,
        }))
      )

      this.users.sort((a, b) => {
        const indexA = this.userOrder.indexOf(a.id)
        const indexB = this.userOrder.indexOf(b.id)
        if (indexA === -1 && indexB === -1) {
          return a.username.localeCompare(b.username)
        }
        if (indexA === -1) return 1
        if (indexB === -1) return -1
        return indexA - indexB
      })

      return this.users
        .map(
          (user) => `
            <div class="user-item" data-userid="${user.id}">
              <span class="user-status ${
                user.active ? "online" : "offline"
              }"></span>
              <span class="user-name">${user.username}</span>
            </div>
          `
        )
        .join("")
    } catch (error) {
      showToast("Failed to load user list")
    }
  }

  async render() {
    const chatSection = document.getElementById("chat")
    chatSection.style.display = "block"
    const usersList = await this.renderUsers()
    chatSection.innerHTML = `
      <div class="chat-container">
        <div class="chat-header">
          <h3>Users</h3>
        </div>
        <div class="users-list">
          ${usersList || ""}
        </div>
      </div>
    `
    await this.loadInitialNotifications()
  }

  init() {
    window.addEventListener("activeUsersUpdated", (event) => {
      this.activeUsers = event.detail
      localStorage.setItem("activeUsers", JSON.stringify(this.activeUsers))
      this.render()
    })

    window.addEventListener("chatMessageReceived", (event) => {
      const message = event.detail
      const partnerId =
        message.sender_id === parseInt(window.app.cUser)
          ? message.receiver_id
          : message.sender_id

      const chatModal = document.querySelector(`#chat-messages-${partnerId}`)
      if (chatModal) {
        this.displayMessages([message], chatModal)
      } else {
        if (message.sender_id !== parseInt(window.app.cUser)) {
          this.updateNotificationBadge(message.sender_id, 1)
          addNotification(message)
        }
      }

      // Update user order
      this.userOrder = [partnerId, ...this.userOrder.filter(id => id !== partnerId)]
      localStorage.setItem("userOrder", JSON.stringify(this.userOrder))
      this.render()
    })

    document.addEventListener("click", (e) => {
      if (e.target.closest(".user-item")) {
        const userId = e.target.closest(".user-item").dataset.userid
        const username = e.target
          .closest(".user-item")
          .querySelector(".user-name").textContent
        this.openChatModal(userId, username)
      }
    })
  }

  async openChatModal(userId, username) {
    const existingModal = document.querySelector(".chat-modal")
    if (existingModal) {
      existingModal.remove()
    }

    const modal = document.createElement("div")
    modal.className = "chat-modal"
    modal.innerHTML = `
      <div class="chat-modal-content">
        <div class="chat-modal-header">
          <h4>${username}</h4>
          <button class="close-chat">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages-${userId}">
        </div>
        <form class="chat-input-form" id="chat-form-${userId}">
          <input type="text" placeholder="Type a message..." required>
          <button type="submit">Send</button>
        </form>
      </div>
    `

    document.body.appendChild(modal)

    try {
      const messages = await handleMessage(window.app.cUser, userId)
      const messagesContainer = document.querySelector(
        `#chat-messages-${userId}`
      )
      await deleteNotification(parseInt(userId), parseInt(window.app.cUser))
      this.updateNotificationBadge(parseInt(userId), 0)

      const lastTenMessages = messages.slice(-10)
      this.displayMessages(lastTenMessages, messagesContainer)

      let offset = 10
      let isLoading = false

      messagesContainer.addEventListener("scroll", () => {
        if (messagesContainer.scrollTop === 0 && !isLoading) {
          isLoading = true
          const nextMessages = messages.slice(-offset - 10, -offset)
          if (nextMessages.length > 0) {
            this.displayMessages(nextMessages, messagesContainer, true)
            offset += 10
          }
          setTimeout(() => {
            isLoading = false
          }, 500)
        }
      })
    } catch (error) {
      showToast("Failed to load message history")
    }

    modal.querySelector(".close-chat").addEventListener("click", () => {
      modal.remove()
    })

    modal.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault()
      const input = e.target.querySelector("input")
      const message = input.value.trim()

      if (message === "") {
        showToast("Message cannot be empty")
        return
      }

      try {
        window.app.wsConnection.send(
          JSON.stringify({
            type: "chat_message",
            sender_id: parseInt(window.app.cUser),
            receiver_id: parseInt(userId),
            content: message,
          })
        )
        input.value = ""
      } catch (error) {
        showToast("Failed to send message")
      }
    })
  }

  getSenderName(userId) {
    const user = this.allUsers.find((user) => user.id === userId)
    return user ? user.username : "Unknown"
  }

  displayMessages(messages, container, prepend = false) {
    if (!container) return

    const messageElements = messages.map((message) => {
      const isSender = message.sender_id === parseInt(window.app.cUser)
      const messageElement = document.createElement("div")
      const senderName = this.getSenderName(message.sender_id)
      messageElement.className = `message ${isSender ? "sent" : "received"}`
      messageElement.innerHTML = `
        <div class="message-sender">${senderName}</div>
        <div class="message-content">
          ${message.content}
        </div>
        <div class="message-time">
          ${message.created_at || new Date().toLocaleTimeString()}
        </div>
      `
      return messageElement
    })

    if (prepend) {
      const firstChild = container.firstChild
      messageElements.forEach((element) => {
        container.insertBefore(element, firstChild)
      })
    } else {
      messageElements.forEach((element) => {
        container.appendChild(element)
      })
      container.scrollTop = container.scrollHeight
    }
  }
}

export default Chat
