package database

import (
	"fmt"
	"real-time-forum/internal/models"
)

// add a new message to the database
func AddMessage(message models.Message) (int, error) {
	result, err := DB.Exec("INSERT INTO messages (type, content, sender_id, receiver_id, created_at) VALUES ($1, $2, $3, $4, $5)", message.Type, message.Content, message.SenderID, message.ReceiverID, message.CreatedAt)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	return int(id), err
}

// get all messages between two users
func GetMessages(senderID, receiverID int) ([]models.Message, error) {
	rows, err := DB.Query("SELECT id, type, content, sender_id, receiver_id, created_at FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)", senderID, receiverID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var message models.Message
		err = rows.Scan(&message.ID, &message.Type, &message.Content, &message.SenderID, &message.ReceiverID, &message.CreatedAt)
		if err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}

	return messages, nil
}

// get all messages for a receiver user and sort it by created_at in descending order and this list should have only the sender_id
/* func GetMessagesByReceiver(receiverID int) ([]int, error) {
	rows, err := DB.Query("SELECT id, type, content, sender_id, receiver_id, created_at FROM messages WHERE receiver_id = $1 ORDER BY created_at DESC", receiverID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var message models.Message
		err = rows.Scan(&message.ID, &message.Type, &message.Content, &message.SenderID, &message.ReceiverID, &message.CreatedAt)
		if err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}

	// get most recent senders id depending on the created date from each sender
	var senders []int
	seen := make(map[int]bool)
	for _, message := range messages {
		if _, ok := seen[message.SenderID]; !ok {
			senders = append(senders, message.SenderID)
			seen[message.SenderID] = true
		}
	}

	return senders, nil
} */

// create a unique list for all users that have sent messages to the receiver or the receiver has sent messages to
// for this unique list we need to get the most recent message
func GetChatOrder(receiverID int) ([]int, error) {
	rows, err := DB.Query("SELECT id, type, content, sender_id, receiver_id, created_at FROM messages WHERE receiver_id = $1 OR sender_id = $1 ORDER BY created_at DESC", receiverID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// if the sender is same as the receiverid then we need to get the receiverid

	var messages []models.Message
	seen := make(map[int]bool)
	for rows.Next() {
		var message models.Message
		err = rows.Scan(&message.ID, &message.Type, &message.Content, &message.SenderID, &message.ReceiverID, &message.CreatedAt)
		if err != nil {
			return nil, err
		}

		if message.SenderID == receiverID {
			message.SenderID = message.ReceiverID
		}

		if _, ok := seen[message.SenderID]; !ok {
			messages = append(messages, message)
			seen[message.SenderID] = true
		}
	}

	// we need to return not the whole message but only the an array of sender_id and if the sender_id is same as the receiverid then we need to return the receiver_id
	var senders []int
	for _, message := range messages {
		if message.SenderID == receiverID {
			senders = append(senders, message.ReceiverID)
		} else {
			senders = append(senders, message.SenderID)
		}
	}

	fmt.Println("messages", messages)
	fmt.Println("senders", senders)
	return senders, nil
}
