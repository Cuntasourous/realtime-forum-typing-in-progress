package functions

import (
	"real-time-forum/internal/models"
	"regexp"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// hashing password

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// validate user data

func ValidUserData(data models.User) (bool, string) {
	emailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_-]{3,16}$`)
	nameRegex := regexp.MustCompile(`^[a-zA-Z]{3,16}$`)

	if !emailRegex.MatchString(data.Email) {
		return false, "Invalid email format. Please use a valid email address (e.g., example@domain.com)."
	}
	if !usernameRegex.MatchString(data.Username) {
		return false, "Username must be 3-16 characters long and can only contain letters, numbers, underscores, or hyphens."
	}
	if !nameRegex.MatchString(data.FirstName) || !nameRegex.MatchString(data.LastName) {
		return false, "Names must be 3-16 characters long and can only contain letters. Please enter a valid first and last name."
	}
	if data.Age < 13 || data.Age > 120 {
		return false, "Age must be between 13 and 120. Please enter a valid age."
	}
	if len(data.Password) < 8 {
		return false, "Password must be at least 8 characters long."
	}

	// Additional manual password checks
	hasUpper := false
	hasLower := false
	hasNumber := false
	hasSpecial := false
	specialChars := "!@#$%^&*()-_+=<>?/"

	for _, char := range data.Password {
		switch {
		case char >= 'A' && char <= 'Z':
			hasUpper = true
		case char >= 'a' && char <= 'z':
			hasLower = true
		case char >= '0' && char <= '9':
			hasNumber = true
		case strings.ContainsRune(specialChars, char):
			hasSpecial = true
		}
	}

	if !hasUpper {
		return false, "Password must contain at least one uppercase letter."
	}
	if !hasLower {
		return false, "Password must contain at least one lowercase letter."
	}
	if !hasNumber {
		return false, "Password must contain at least one number."
	}
	if !hasSpecial {
		return false, "Password must contain at least one special character."
	}
	if data.Password != data.PasswordRep {
		return false, "Passwords do not match. Please ensure both password fields are identical."
	}

	return true, ""
}
