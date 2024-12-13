package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"real-time-forum/internal/database"
	"real-time-forum/internal/models"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type connection struct {
	// Buffered channel of outbound messages.
	send chan []byte
	id   int
	// The hub.
	h *Hub
}

func (c *connection) reader(wg *sync.WaitGroup, wsConn *websocket.Conn) {
	defer wg.Done()
	for {
		_, message, err := wsConn.ReadMessage()
		if err != nil {
			log.Printf("WebSocket closed for user %d: %v", c.id, err)
			c.h.removeConnection(c)
			break
		}
		var msg = models.Message{}
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("error unmarshalling message: %v", err)
			continue
		}

		if msg.Type == "chat_message" {
			msg.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
			// store in database
			msgID, err := database.AddMessage(msg)
			if err != nil {
				log.Printf("error adding message to database: %v", err)
			}
			msg.ID = msgID
			message, _ = json.Marshal(msg)
			c.h.broadcastChatMessage(message, msg.SenderID, msg.ReceiverID)
		} else {
			c.h.broadcast <- message
		}
	}
}

func (c *connection) writer(wg *sync.WaitGroup, wsConn *websocket.Conn) {
	defer wg.Done()
	for message := range c.send {
		err := wsConn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			break
		}
	}
}

var upgrader = &websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}

type WsHandler struct {
	H *Hub
}

func (wsh WsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	wsConn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("error upgrading %s", err)
		return
	}
	// get user id from cookie
	cookie, err := r.Cookie("Session_token")
	if err != nil {
		log.Printf("error getting cookie %s", err)
		return
	}
	sessionID := cookie.Value
	sessionData, exists, err := database.GetSession(sessionID)
	if err != nil {
		log.Printf("error getting session %s", err)
		return
	}
	if !exists || time.Now().After(sessionData.Expiration) {
		log.Printf("session expired %s", err)
		return
	}
	userId := sessionData.UserID
	c := &connection{send: make(chan []byte, 256), h: wsh.H, id: userId}
	c.h.addConnection(c)
	defer c.h.removeConnection(c)
	var wg sync.WaitGroup
	wg.Add(2)
	go c.writer(&wg, wsConn)
	go c.reader(&wg, wsConn)
	wg.Wait()
	wsConn.Close()
}
