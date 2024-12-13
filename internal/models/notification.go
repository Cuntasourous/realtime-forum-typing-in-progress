package models

type Notification struct {
	ID         int    `json:"id"`
	SenderID   int    `json:"sender_id"`
	ReceiverID int    `json:"receiver_id"`
	MessageID  int    `json:"message_id"`
	CreatedAt  string `json:"created_at"`
}
