package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/database"
	"real-time-forum/internal/models"
	"strconv"
)

func NotificationsHandler(w http.ResponseWriter, r *http.Request) {
	// switch for get and post and delete requests
	switch r.Method {
	case http.MethodGet:
		handleNotifGet(w, r)
	case http.MethodPost:
		handleNotifPost(w, r)
	case http.MethodDelete:
		handleNotifDelete(w, r)
	default:
		jsonResponse(w, Response{Message: "Method not allowed"}, http.StatusMethodNotAllowed)
	}
}

func handleNotifGet(w http.ResponseWriter, r *http.Request) {
	// user id from query params
	userID := r.URL.Query().Get("id")
	if userID == "" {
		jsonResponse(w, Response{Message: "User ID is required"}, http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(userID)
	if err != nil {
		jsonResponse(w, Response{Message: "Invalid user ID"}, http.StatusBadRequest)
		return
	}

	// get notifications from database
	notifications, err := database.GetNotifications(id)
	if err != nil {
		jsonResponse(w, Response{Message: "Failed to get notifications", Error: err.Error()}, http.StatusInternalServerError)
		return
	}

	jsonResponse(w, Response{Message: "Notifications retrieved successfully ", Data: notifications}, http.StatusOK)
}

func handleNotifPost(w http.ResponseWriter, r *http.Request) {
	var message models.Message
	if err := json.NewDecoder(r.Body).Decode(&message); err != nil {
		jsonResponse(w, Response{Message: "Invalid request data", Error: err.Error()}, http.StatusBadRequest)
		return
	}

	// add notification to database
	err := database.AddNotification(message)
	if err != nil {
		jsonResponse(w, Response{Message: "Failed to create notification", Error: err.Error()}, http.StatusInternalServerError)
		return
	}

	jsonResponse(w, Response{Message: "Notification created successfully"}, http.StatusCreated)
}

func handleNotifDelete(w http.ResponseWriter, r *http.Request) {
	// query params for sender and receiver id
	senderID := r.URL.Query().Get("sender_id")
	receiverID := r.URL.Query().Get("receiver_id")
	if senderID == "" || receiverID == "" {
		jsonResponse(w, Response{Message: "Sender and receiver IDs are required"}, http.StatusBadRequest)
		return
	}

	sID, err := strconv.Atoi(senderID)
	if err != nil {
		jsonResponse(w, Response{Message: "Invalid sender ID"}, http.StatusBadRequest)
		return
	}

	rID, err := strconv.Atoi(receiverID)
	if err != nil {
		jsonResponse(w, Response{Message: "Invalid receiver ID"}, http.StatusBadRequest)
		return
	}

	// delete notification from database
	err = database.DeleteNotification(sID, rID)
	if err != nil {
		jsonResponse(w, Response{Message: "Failed to delete notification", Error: err.Error()}, http.StatusInternalServerError)
		return
	}

	jsonResponse(w, Response{Message: "Notification deleted successfully"}, http.StatusOK)
}
