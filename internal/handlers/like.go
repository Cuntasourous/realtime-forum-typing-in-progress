package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/database"
)

func LikeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonResponse(w, Response{Message: "Invalid request method"}, http.StatusMethodNotAllowed)
		return
	}

	// Check if user is logged in
	userID, err := SessionActive(r)
	if err != nil {
		jsonResponse(w, Response{Message: "Login to add likes", Error: err.Error()}, http.StatusUnauthorized)
		return
	}

	// Decode request body
	var data struct {
		Type       string `json:"type"`
		ID         int    `json:"id"`
		EntityType string `json:"entityType"`
	}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		jsonResponse(w, Response{Message: "Invalid request data", Error: err.Error()}, http.StatusBadRequest)
		return
	}

	// Call database function to add like/dislike
	likes, err := database.Liking(data.EntityType, data.Type, data.ID, userID)
	if err != nil {
		jsonResponse(w, Response{Message: "Failed to add like", Error: err.Error()}, http.StatusInternalServerError)
		return
	}

	// Success response
	jsonResponse(w, Response{
		Message: "Like added successfully",
		Data: map[string]int{
			"likes":    likes[0],
			"dislikes": likes[1],
		},
	}, http.StatusOK)
}
