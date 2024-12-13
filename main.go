package main

import (
	"fmt"
	"log"
	"net/http"

	"real-time-forum/internal/config"
	"real-time-forum/internal/database"
	"real-time-forum/internal/handlers"
	"real-time-forum/internal/websocket"
)

func main() {
	err := config.LoadConfig()
	if err != nil {
		log.Fatal("Error loading config: ", err)
	}

	// initiate the database
	database.InitDB()

	// initiate a new hub
	h := websocket.NewHub()

	// CORS middleware
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	}

	// api
	http.Handle("/api/login",
		corsMiddleware(handlers.LoggingMiddleware(http.HandlerFunc(handlers.LoginSubmitHandler))))
	http.Handle("/api/signup",
		corsMiddleware(handlers.LoggingMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlers.SignupSubmitHandler(w, r, h)
		}))))
	http.Handle("/api/logout",
		corsMiddleware(handlers.SessionMiddleware(http.HandlerFunc(handlers.LogoutHandler))))
	http.Handle("/api/post",
		corsMiddleware(handlers.SessionMiddleware(http.HandlerFunc(handlers.PostHandler))))
	http.Handle("/api/comment",
		corsMiddleware(handlers.SessionMiddleware(http.HandlerFunc(handlers.CommentHandler))))
	http.Handle("/api/like",
		corsMiddleware(handlers.SessionMiddleware(http.HandlerFunc(handlers.LikeHandler))))
	http.Handle("/api/filter",
		corsMiddleware(handlers.SessionMiddleware(http.HandlerFunc(handlers.FilterHandler))))
	http.Handle("/api/users",
		corsMiddleware(handlers.LoggingMiddleware(http.HandlerFunc(handlers.UsersHandler))))
	http.Handle("/api/messages",
		corsMiddleware(handlers.SessionMiddleware(http.HandlerFunc(handlers.MessagesHandler))))
	http.Handle("/api/user",
		corsMiddleware(handlers.SessionMiddleware(http.HandlerFunc(handlers.UserHandler))))
	http.Handle("/api/notifications",
		corsMiddleware(handlers.SessionMiddleware(http.HandlerFunc(handlers.NotificationsHandler))))
	http.Handle("/api/chatorder",
		corsMiddleware(handlers.SessionMiddleware(http.HandlerFunc(handlers.ChatOrderHandler))))
	http.Handle("/api/session", corsMiddleware(http.HandlerFunc(handlers.SessionHandler)))
	http.Handle("/api/categories", corsMiddleware(http.HandlerFunc(handlers.CategoriesHandler)))
	http.Handle("/ws", corsMiddleware(websocket.WsHandler{H: h}))

	// serve index.html
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./web/templates/index.html")
	})

	// serve static files
	fs := http.FileServer(http.Dir("./web/static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// listen and serve
	addr := fmt.Sprintf("%s:%d",
		config.Config.Server.Host,
		config.Config.Server.Port)
	log.Println("Server is running on", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
