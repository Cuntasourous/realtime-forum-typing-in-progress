package models

type Message struct {
	ID         int         `json:"id"`
	Type       string      `json:"type"`
	Content    interface{} `json:"content"`
	SenderID   int         `json:"sender_id"`
	ReceiverID int         `json:"receiver_id"`
	CreatedAt  string      `json:"created_at"`
}
