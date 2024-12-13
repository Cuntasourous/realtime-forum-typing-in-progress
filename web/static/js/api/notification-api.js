const NOTIFURL = "http://localhost:8080/api/notifications"

import { showToast } from "../app.js"

function handleError(message) {
  showToast(message)
  throw new Error(message)
}

export async function getNotifications(userId) {
  try {
    const response = await fetch(`${NOTIFURL}?id=${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    const result = await response.json()
    if (response.ok) {
      return result.data
    } else {
      handleError(result.message || "Failed to retrieve notifications")
    }
  } catch (error) {
    handleError("An error occurred while fetching notifications")
  }
}

export async function addNotification(message) {
  try {
    const response = await fetch(NOTIFURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    })

    const result = await response.json()
    if (response.ok) {
      return result.data
    } else {
      handleError(result.message || "Failed to create notification")
    }
  } catch (error) {
    handleError("An error occurred while creating notification")
  }
}

export async function deleteNotification(senderId, receiverId) {
  try {
    const response = await fetch(
      `${NOTIFURL}?sender_id=${senderId}&receiver_id=${receiverId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    )

    const result = await response.json()
    if (response.ok) {
      return result.data
    } else {
      handleError(result.message || "Failed to delete notification")
    }
  } catch (error) {
    handleError("An error occurred while deleting notification")
  }
}
