package websocket

import (
	"encoding/json"
	"log"
	"real-time-forum/internal/database"
	"real-time-forum/internal/models"
	"sync"
	"time"
)

type Hub struct {
	// the mutex to protect connections
	connectionsMx sync.RWMutex

	// Registered connections.
	connections map[*connection]struct{}

	// Inbound messages from the connections.
	broadcast chan []byte

	activeUsers map[int]struct{}

	// logMx sync.RWMutex
	// log   [][]byte
}

func NewHub() *Hub {
	h := &Hub{
		connectionsMx: sync.RWMutex{},
		broadcast:     make(chan []byte),
		connections:   make(map[*connection]struct{}),
		activeUsers:   make(map[int]struct{}),
	}

	go func() {
		for {
			msg := <-h.broadcast
			log.Printf("Broadcasting message: %s", string(msg))
			h.connectionsMx.RLock()
			for c := range h.connections {
				// only send to sender and recipient
				select {
				case c.send <- msg:
					log.Printf("Message sent to connection ID: %d", c.id)
				// stop trying to send to this connection after trying for 1 second.
				// if we have to stop, it means that a reader died so remove the connection also.
				case <-time.After(1 * time.Second):
					log.Printf("shutting down connection %v", *c)
					h.removeConnection(c)
				}
			}
			h.connectionsMx.RUnlock()
		}
	}()
	return h
}

func (h *Hub) addConnection(conn *connection) {
	h.connectionsMx.Lock()
	defer h.connectionsMx.Unlock()

	// Check if user already has a connection
	for existingConn := range h.connections {
		if existingConn.id == conn.id {
			delete(h.connections, existingConn)
			close(existingConn.send)
		}
	}

	h.connections[conn] = struct{}{}
	h.activeUsers[conn.id] = struct{}{}

	// Broadcast updated active users list to all connections
	h.BroadcastActiveUsers()
	log.Printf("connections: %v", h.connections)
}

func (h *Hub) removeConnection(conn *connection) {
	h.connectionsMx.Lock()
	defer h.connectionsMx.Unlock()
	if _, ok := h.connections[conn]; ok {
		delete(h.connections, conn)
		delete(h.activeUsers, conn.id)
		h.BroadcastActiveUsers()
		log.Printf("Connection removed for user %d", conn.id)
		close(conn.send)
	}
	log.Printf("connections: %v", h.connections)
}

func (h *Hub) BroadcastActiveUsers() {
	activeUserIDs := make([]int, 0, len(h.activeUsers))
	for userID := range h.activeUsers {
		activeUserIDs = append(activeUserIDs, userID)
	}
	message := models.Message{
		Type:    "active_users",
		Content: activeUserIDs,
	}
	msg, _ := json.Marshal(message)
	h.broadcast <- msg
}

func (h *Hub) broadcastChatMessage(msg []byte, senderID int, recipientID int) {
	if _, isActive := h.activeUsers[recipientID]; !isActive {
		message := models.Message{}
		if err := json.Unmarshal(msg, &message); err == nil {
			database.AddNotification(message)
		}
	}

	h.connectionsMx.RLock()
	defer h.connectionsMx.RUnlock()

	for c := range h.connections {
		if c.id == senderID || c.id == recipientID {
			select {
			case c.send <- msg:
				log.Printf("Chat message sent to user ID: %d", c.id)
			case <-time.After(1 * time.Second):
				log.Printf("Failed to send message to user %d", c.id)
				h.removeConnection(c)
			}
		}
	}
}
