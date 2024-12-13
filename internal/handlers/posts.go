package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"real-time-forum/internal/database"
	"real-time-forum/internal/models"
)

// PostHandler handles both GET and POST requests for posts
func PostHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handleGet(w, r)
	case http.MethodPost:
		handlePost(w, r)
	default:
		jsonResponse(w, Response{Message: "Method not allowed"}, http.StatusMethodNotAllowed)
	}
}

// handlePost processes the creation of a new post
func handlePost(w http.ResponseWriter, r *http.Request) {
	var data models.Post
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		jsonResponse(w, Response{Message: "Invalid request data", Error: err.Error()}, http.StatusBadRequest)
		return
	}

	userID, err := SessionActive(r)
	if err != nil {
		jsonResponse(w, Response{Message: "Login required to create posts", Error: err.Error()}, http.StatusUnauthorized)
		return
	}

	// Validate title and content
	title := strings.TrimSpace(data.Title)
	content := strings.TrimSpace(data.Content)
	if title == "" || content == "" {
		jsonResponse(w, Response{Message: "Title and content cannot be empty"}, http.StatusBadRequest)
		return
	}

	data.UserID = userID
	postID, err := database.CreatePost(data)
	if err != nil {
		jsonResponse(w, Response{Message: "Failed to create post", Error: err.Error()}, http.StatusInternalServerError)
		return
	}

	jsonResponse(w, Response{
		Message: "Post created successfully",
		Data: map[string]int{
			"post_id": postID,
		},
	}, http.StatusCreated)
}

// handleGet retrieves posts or a specific post by ID
func handleGet(w http.ResponseWriter, r *http.Request) {
	postID := r.URL.Query().Get("id")
	if postID != "" {
		id, err := strconv.Atoi(postID)
		if err != nil {
			jsonResponse(w, Response{Message: "Invalid post ID format", Error: err.Error()}, http.StatusBadRequest)
			return
		}

		post, err := database.GetPosts(id, "SINGLE")
		if err != nil {
			jsonResponse(w, Response{Message: "Failed to retrieve post", Error: err.Error()}, http.StatusInternalServerError)
			return
		}

		comments, err := database.GetComments(id)
		if err != nil {
			jsonResponse(w, Response{Message: "Failed to retrieve comments", Error: err.Error()}, http.StatusInternalServerError)
			return
		}

		jsonResponse(w, Response{
			Message: "Post retrieved successfully",
			Data: map[string]interface{}{
				"post":     post,
				"comments": comments,
			},
		}, http.StatusOK)
	} else {
		posts, err := database.GetPosts(0, "ALL")
		if err != nil {
			jsonResponse(w, Response{Message: "Failed to retrieve posts", Error: err.Error()}, http.StatusInternalServerError)
			return
		}

		categories, err := database.GetCategories()
		if err != nil {
			jsonResponse(w, Response{Message: "Failed to retrieve categories", Error: err.Error()}, http.StatusInternalServerError)
			return
		}

		jsonResponse(w, Response{
			Message: "Posts retrieved successfully",
			Data: map[string]interface{}{
				"posts":      posts,
				"categories": categories,
			},
		}, http.StatusOK)
	}
}

// CategoriesHandler handles the retrieval of all categories
func CategoriesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonResponse(w, Response{Message: "Method not allowed"}, http.StatusMethodNotAllowed)
		return
	}

	categories, err := database.GetCategories()
	if err != nil {
		jsonResponse(w, Response{Message: "Failed to retrieve categories", Error: err.Error()}, http.StatusInternalServerError)
		return
	}

	jsonResponse(w, Response{
		Message: "Categories retrieved successfully",
		Data:    categories,
	}, http.StatusOK)
}
