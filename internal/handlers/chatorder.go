package handlers

import (
	"net/http"
	"real-time-forum/internal/database"
	"strconv"
)

func ChatOrderHandler(w http.ResponseWriter, r *http.Request) {
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

	chatOrder, err := database.GetChatOrder(id)
	if err != nil {
		jsonResponse(w, Response{Message: "Error getting chat order"}, http.StatusInternalServerError)
		return
	}

	jsonResponse(w, Response{Data: chatOrder}, http.StatusOK)
}
