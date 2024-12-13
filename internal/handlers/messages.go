package handlers

import (
	"net/http"
	"real-time-forum/internal/database"
	"strconv"
)

func MessagesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonResponse(w, Response{Message: "Invalid request method"}, http.StatusMethodNotAllowed)
		return
	}

	// Retrieve query parameters for sender and receiver
	q := r.URL.Query()
	sender := q.Get("sender")
	receiver := q.Get("receiver")

	// Validate sender ID
	senderID, err := strconv.Atoi(sender)
	if err != nil {
		jsonResponse(w, Response{Message: "Invalid sender ID format", Error: err.Error()}, http.StatusBadRequest)
		return
	}

	// Validate receiver ID
	receiverID, err := strconv.Atoi(receiver)
	if err != nil {
		jsonResponse(w, Response{Message: "Invalid receiver ID format", Error: err.Error()}, http.StatusBadRequest)
		return
	}

	// Fetch messages from the database
	messages, err := database.GetMessages(senderID, receiverID)
	if err != nil {
		jsonResponse(w, Response{Message: "Failed to fetch messages", Error: err.Error()}, http.StatusInternalServerError)
		return
	}

	// Successful response with fetched messages
	jsonResponse(w, Response{
		Message: "Messages fetched successfully",
		Data:    messages,
	}, http.StatusOK)
}
