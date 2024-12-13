package handlers

import (
	"encoding/json"
	"net/http"

	"real-time-forum/internal/database"
	"real-time-forum/internal/models"
)

func FilterHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := SessionActive(r)
	if err != nil {
		jsonResponse(w, Response{Message: "Forbidden: No session token", Error: err.Error()}, http.StatusForbidden)
		return
	}

	if r.Method != http.MethodPost {
		jsonResponse(w, Response{Message: "Invalid request method"}, http.StatusMethodNotAllowed)
		return
	}

	var filterParams map[string][]string
	if err := json.NewDecoder(r.Body).Decode(&filterParams); err != nil {
		jsonResponse(w, Response{Message: "Invalid request data", Error: err.Error()}, http.StatusBadRequest)
		return
	}

	var filteredPosts []models.Post

	// Filter by category
	if categories, exists := filterParams["categories"]; exists {
		filteredPosts, err = filterByCategory(categories)
		if err != nil {
			jsonResponse(w, Response{Message: "Failed to filter by category", Error: err.Error()}, http.StatusInternalServerError)
			return
		}
	} else {
		filteredPosts, err = database.GetPosts(0, "ALL")
		if err != nil {
			jsonResponse(w, Response{Message: "Failed to retrieve posts", Error: err.Error()}, http.StatusInternalServerError)
			return
		}
	}

	// Filter by user-specific options (liked/created posts)
	if byUser, exists := filterParams["byUser"]; exists {
		var userPosts []models.Post
		var userLikes []models.Post
		crposts, likeposts := false, false

		for _, option := range byUser {
			switch option {
			case "crposts":
				userPosts, err = database.GetPostsByUser(userID)
				if err != nil {
					jsonResponse(w, Response{Message: "Failed to retrieve user's created posts", Error: err.Error()}, http.StatusInternalServerError)
					return
				}
				crposts = true
			case "likeposts":
				userLikes, err = filterByUserLiked(userID)
				if err != nil {
					jsonResponse(w, Response{Message: "Failed to retrieve user's liked posts", Error: err.Error()}, http.StatusInternalServerError)
					return
				}
				likeposts = true
			}
		}

		// Merge filtered results based on user preferences
		if crposts && likeposts {
			filteredPosts = mergePosts(filteredPosts, userPosts, userLikes)
		} else if crposts {
			filteredPosts = mergePosts(filteredPosts, userPosts, nil)
		} else if likeposts {
			filteredPosts = mergePosts(filteredPosts, nil, userLikes)
		}
	}

	// Return the filtered posts
	jsonResponse(w, Response{
		Message: "Filtered posts retrieved successfully",
		Data: map[string]interface{}{
			"posts": filteredPosts,
		},
	}, http.StatusOK)
}

func filterByCategory(categories []string) ([]models.Post, error) {
	var allPosts []models.Post
	for _, category := range categories {
		posts, err := database.GetPostsByCategory(category)
		if err != nil {
			return nil, err
		}
		allPosts = append(allPosts, posts...)
	}
	return allPosts, nil
}

func filterByUserLiked(userID int) ([]models.Post, error) {
	userLikes := []models.Post{}
	likesData, err := database.GetLikesTable()
	if err != nil {
		return nil, err
	}

	for _, like := range likesData {
		if like.UserID == userID && like.LikeType == 1 && like.PostID != nil {
			post, err := database.GetPosts(*like.PostID, "SINGLE")
			if err != nil {
				return nil, err
			}
			userLikes = append(userLikes, post[0])
		}
	}

	return userLikes, nil
}

func mergePosts(existing, createdPosts, likedPosts []models.Post) []models.Post {
	if createdPosts == nil && likedPosts == nil {
		return existing
	}

	filteredPosts := []models.Post{}

	filterPosts := func(posts []models.Post) {
		for _, post := range posts {
			for _, existingPost := range existing {
				if post.ID == existingPost.ID {
					exists := false
					for _, filteredPost := range filteredPosts {
						if filteredPost.ID == existingPost.ID {
							exists = true
							break
						}
					}
					if !exists {
						filteredPosts = append(filteredPosts, existingPost)
					}
				}
			}
		}
	}

	if createdPosts != nil {
		filterPosts(createdPosts)
	}

	if likedPosts != nil {
		filterPosts(likedPosts)
	}

	return filteredPosts
}
