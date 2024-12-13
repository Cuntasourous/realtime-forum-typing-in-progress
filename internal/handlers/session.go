package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"real-time-forum/internal/database"

	"github.com/gofrs/uuid/v5"
)

func GenerateSessionID() (string, error) {
	uuid, err := uuid.NewV4()
	if err != nil {
		return "", err
	}
	return uuid.String(), nil
}

func SetCookie(userID int) (http.Cookie, error) {
	sessionID, err := GenerateSessionID()
	if err != nil {
		return http.Cookie{}, err
	}

	expiration := time.Now().Add(12 * time.Hour)
	cookie := http.Cookie{
		Name:     "Session_token",
		Value:    sessionID,
		Expires:  expiration,
		HttpOnly: true,
		Path:     "/",
	}

	err = database.StoreSession(sessionID, userID, expiration)
	if err != nil {
		return http.Cookie{}, err
	}

	return cookie, nil
}

func SessionMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// logging requests
		fmt.Printf("Request: %s %s\n", r.Method, r.URL.Path)

		cookie, err := r.Cookie("Session_token")
		if err != nil {
			response := Response{Message: "Forbidden: No session token", Error: err.Error()}
			jsonResponse(w, response, http.StatusForbidden)
			return
		}

		sessionID := cookie.Value
		sessionData, exists, err := database.GetSession(sessionID)
		if err != nil {
			response := Response{Message: "Internal server error", Error: err.Error()}
			jsonResponse(w, response, http.StatusInternalServerError)
			return
		}
		if !exists || time.Now().After(sessionData.Expiration) {
			response := Response{Message: "Forbidden: Not exist or expired"}
			jsonResponse(w, response, http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("Request: %s %s\n", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

func SessionActive(r *http.Request) (int, error) {
	cookie, err := r.Cookie("Session_token")
	if err != nil {
		return 0, errors.New("forbidden: No session token")
	}
	sessionID := cookie.Value
	sessionData, exists, err := database.GetSession(sessionID)
	if err != nil {
		return 0, err
	}
	if !exists || time.Now().After(sessionData.Expiration) {
		return 0, errors.New("forbidden: Not exist or expired")
	}

	return sessionData.UserID, nil
}

func SessionHandler(w http.ResponseWriter, r *http.Request) {
	// this api will call from the js after getting the cookie from the browser
	// then it will check if the session is active or not
	if r.Method == http.MethodGet {
		var response Response
		type data struct {
			ID       int    `json:"id"`
			Username string `json:"username"`
		}

		userID, _ := SessionActive(r)
		if userID == 0 {
			response = Response{Message: "Session not active", Data: data{}}
			jsonResponse(w, response, http.StatusOK)
			return
		}
		users, err := database.GetUsers()
		if err != nil {
			response = Response{Message: "Internal server error", Error: err.Error()}
			jsonResponse(w, response, http.StatusInternalServerError)
			return
		}
		for _, user := range users {
			if user.ID == userID {
				response = Response{
					Message: "Session active",
					Data: data{
						ID:       user.ID,
						Username: user.Username,
					},
				}
			}
		}
		jsonResponse(w, response, http.StatusOK)
	}
}
