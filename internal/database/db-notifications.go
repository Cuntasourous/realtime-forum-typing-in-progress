package database

import "real-time-forum/internal/models"

// add notification to database, this function will get the model message and store it
func AddNotification(msg models.Message) error {
	_, err := DB.Exec("INSERT INTO notifications (sender_id, receiver_id, message_id, created_at) VALUES ($1, $2, $3, $4)", msg.SenderID, msg.ReceiverID, msg.ID, msg.CreatedAt)
	return err
}

// get all notifications for a receiver id
func GetNotifications(receiverID int) ([]models.Notification, error) {
	rows, err := DB.Query("SELECT id, sender_id, receiver_id, message_id, created_at FROM notifications WHERE receiver_id = $1", receiverID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var notification models.Notification
		err = rows.Scan(&notification.ID, &notification.SenderID, &notification.ReceiverID, &notification.MessageID, &notification.CreatedAt)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}

	return notifications, nil
}

// delete a notification from the database for a sender id and receiver id
func DeleteNotification(senderID, receiverID int) error {
	_, err := DB.Exec("DELETE FROM notifications WHERE sender_id = $1 AND receiver_id = $2", senderID, receiverID)
	return err
}
