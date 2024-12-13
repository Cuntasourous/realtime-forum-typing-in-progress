package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"real-time-forum/internal/database"
	"real-time-forum/internal/models"
)

func CommentHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonResponse(w, Response{Message: "Invalid request method"}, http.StatusMethodNotAllowed)
		return
	}

	// Check for active session
	userID, err := SessionActive(r)
	if err != nil {
		jsonResponse(w, Response{Message: "Login to add comments", Error: err.Error()}, http.StatusUnauthorized)
		return
	}

	// Decode request data
	var data struct {
		Content string `json:"content"`
		PostID  string `json:"post_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		jsonResponse(w, Response{Message: "Invalid request data", Error: err.Error()}, http.StatusBadRequest)
		return
	}

	// Validate comment content
	content := strings.TrimSpace(data.Content)
	if content == "" {
		jsonResponse(w, Response{Message: "Comment content cannot be empty"}, http.StatusBadRequest)
		return
	}

	// Validate post ID
	postID, err := strconv.Atoi(data.PostID)
	if err != nil {
		jsonResponse(w, Response{Message: "Invalid post ID format", Error: err.Error()}, http.StatusBadRequest)
		return
	}

	// Create comment
	comment := models.Comment{
		UserID:  userID,
		PostID:  postID,
		Content: content,
	}
	if err := database.CreateComment(comment); err != nil {
		jsonResponse(w, Response{Message: "Failed to add comment", Error: err.Error()}, http.StatusInternalServerError)
		return
	}

	// Success response
	jsonResponse(w, Response{Message: "Comment added successfully"}, http.StatusOK)
}
