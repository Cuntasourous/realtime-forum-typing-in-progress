package handlers

import (
	"net/http"
	"real-time-forum/internal/database"
	"strconv"
)

func UsersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonResponse(w, Response{Message: "Method not allowed"}, http.StatusMethodNotAllowed)
		return
	}

	users, err := database.GetUsers()
	if err != nil {
		jsonResponse(w, Response{Message: "Unable to retrieve users", Error: err.Error()}, http.StatusInternalServerError)
		return
	}

	// Map users to a simplified format for the response
	newUsers := make([]map[string]interface{}, len(users))
	for i, user := range users {
		newUsers[i] = map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		}
	}

	jsonResponse(w, Response{Message: "Users retrieved successfully", Data: newUsers}, http.StatusOK)
}

func UserHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonResponse(w, Response{Message: "Method not allowed"}, http.StatusMethodNotAllowed)
		return
	}

	userIdParam := r.URL.Query().Get("userId")
	if userIdParam == "" {
		jsonResponse(w, Response{Message: "User ID is required"}, http.StatusBadRequest)
		return
	}

	userId, err := strconv.Atoi(userIdParam)
	if err != nil {
		jsonResponse(w, Response{Message: "Invalid user ID format", Error: err.Error()}, http.StatusBadRequest)
		return
	}

	user, err := database.GetUser(userId)
	if err != nil {
		jsonResponse(w, Response{Message: "User not found", Error: err.Error()}, http.StatusNotFound)
		return
	}

	jsonResponse(w, Response{Message: "User retrieved successfully", Data: user}, http.StatusOK)
}
