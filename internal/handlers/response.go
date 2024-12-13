package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/models"
)

type PageData struct {
	Posts      []models.Post
	Comments   []models.Comment
	LoggedIn   bool
	Categories []models.Category // Add this line
}

type Response struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func jsonResponse(w http.ResponseWriter, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
