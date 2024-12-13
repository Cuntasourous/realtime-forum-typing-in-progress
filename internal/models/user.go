package models

type User struct {
	ID          int    `json:"id"`
	Email       string `json:"email"`
	Username    string `json:"username"`
	FirstName   string `json:"firstname"`
	LastName    string `json:"lastname"`
	Gender      string `json:"gender"`
	Age         int    `json:"age"`
	Password    string `json:"password"` // Encrypted
	PasswordRep string `json:"password-rep"`
}
