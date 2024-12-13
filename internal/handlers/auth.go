package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"real-time-forum/internal/database"
	"real-time-forum/internal/functions"
	"real-time-forum/internal/models"
	"real-time-forum/internal/websocket"
)

func AuthenticateUser(username_email, psw string) (int, error) {
	username_email = strings.ToLower(username_email)
	users, err := database.GetUsers()
	if err != nil {
		return 0, err
	}

	for _, user := range users {
		if user.Username == username_email || user.Email == username_email {
			if functions.CheckPasswordHash(psw, user.Password) {
				return user.ID, nil
			}
		}
	}
	return 0, errors.New("invalid credentials")
}

func LoginSubmitHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonResponse(w, Response{Message: "Invalid request method"}, http.StatusMethodNotAllowed)
		return
	}

	var data map[string]string
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		jsonResponse(w, Response{Message: "Invalid request data", Error: err.Error()}, http.StatusBadRequest)
		return
	}

	userID, err := AuthenticateUser(data["username_email"], data["password"])
	if err != nil {
		jsonResponse(w, Response{Message: "Unauthorized", Error: err.Error()}, http.StatusUnauthorized)
		return
	}

	// Delete existing sessions for this user
	if err := database.DeleteUserSessions(userID); err != nil {
		jsonResponse(w, Response{Message: "Internal server error"}, http.StatusInternalServerError)
		return
	}

	// Create a new session
	cookie, err := SetCookie(userID)
	if err != nil {
		jsonResponse(w, Response{Message: "Internal server error"}, http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, &cookie)
	jsonResponse(w, Response{Message: "Login successful", Data: map[string]interface{}{"user_id": userID}}, http.StatusOK)
}

func SignupSubmitHandler(w http.ResponseWriter, r *http.Request, h *websocket.Hub) {
	if r.Method != http.MethodPost {
		jsonResponse(w, Response{Message: "Invalid request method"}, http.StatusMethodNotAllowed)
		return
	}

	var dataBody map[string]string
	if err := json.NewDecoder(r.Body).Decode(&dataBody); err != nil {
		jsonResponse(w, Response{Message: "Invalid request data", Error: err.Error()}, http.StatusBadRequest)
		return
	}

	age, err := strconv.Atoi(dataBody["age"])
	if err != nil {
		jsonResponse(w, Response{Message: "Invalid age value", Error: err.Error()}, http.StatusBadRequest)
		return
	}

	username := strings.ToLower(dataBody["username"])
	email := strings.ToLower(dataBody["email"])

	userData := models.User{
		Email:       email,
		Username:    username,
		FirstName:   dataBody["firstname"],
		LastName:    dataBody["lastname"],
		Gender:      dataBody["gender"],
		Age:         age,
		Password:    dataBody["password"],
		PasswordRep: dataBody["password-rep"],
	}

	// Validate passwords
	if userData.Password != userData.PasswordRep {
		jsonResponse(w, Response{Message: "Passwords do not match"}, http.StatusBadRequest)
		return
	}

	// Validate user data
	if valid, msg := functions.ValidUserData(userData); !valid {
		jsonResponse(w, Response{Message: msg}, http.StatusBadRequest)
		return
	}

	// Check if username or email is already taken
	users, err := database.GetUsers()
	if err != nil {
		jsonResponse(w, Response{Message: "Internal server error"}, http.StatusInternalServerError)
		return
	}
	for _, user := range users {
		if user.Username == userData.Username {
			jsonResponse(w, Response{Message: "Username is already taken"}, http.StatusBadRequest)
			return
		}
		if user.Email == userData.Email {
			jsonResponse(w, Response{Message: "Email is already registered"}, http.StatusBadRequest)
			return
		}
	}

	// Hash the password and create user
	hashedPassword, err := functions.HashPassword(userData.Password)
	if err != nil {
		jsonResponse(w, Response{Message: "Internal server error"}, http.StatusInternalServerError)
		return
	}
	userData.Password = hashedPassword

	if err := database.CreateUser(userData); err != nil {
		jsonResponse(w, Response{Message: "Internal server error"}, http.StatusInternalServerError)
		return
	}

	// Notify clients of the new active user
	h.BroadcastActiveUsers()
	jsonResponse(w, Response{Message: "Signup successful", Data: map[string]interface{}{"user_id": userData.ID}}, http.StatusOK)
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		jsonResponse(w, Response{Message: "Invalid request method"}, http.StatusMethodNotAllowed)
		return
	}

	// Clear session cookie to log out the user
	http.SetCookie(w, &http.Cookie{
		Name:     "Session_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
	})
	jsonResponse(w, Response{Message: "Logout successful"}, http.StatusOK)
}
