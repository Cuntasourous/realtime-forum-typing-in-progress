package database

import "real-time-forum/internal/models"

func CreateUser(user models.User) error {
	sqlStm := `INSERT INTO users 
	(email, username, firstname, lastname, gender, age, password) 
	VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	stm, err := DB.Prepare(sqlStm)
	if err != nil {
		return err
	}
	defer stm.Close()

	_, err = stm.Exec(user.Email, user.Username, user.FirstName, user.LastName,
		user.Gender, user.Age, user.Password)
	if err != nil {
		return err
	}

	return nil
}

func GetUsers() ([]models.User, error) {
	sqlStm := `SELECT id, 
	email, username,
	password FROM users
	`
	stm, err := DB.Prepare(sqlStm)
	if err != nil {
		return nil, err
	}
	defer stm.Close()

	rows, err := stm.Query()
	if err != nil {
		return nil, err
	}
	users := make([]models.User, 0)
	for rows.Next() {
		user := models.User{}
		err := rows.Scan(&user.ID, &user.Email, &user.Username, &user.Password)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func GetUser(userId int) (models.User, error) {
	query := `SELECT email, username,
	firstname, lastname,
	gender, age FROM users WHERE users.id = ?`

	var user models.User

	rows, err := DB.Query(query, userId)
	if err != nil {
		return user, err
	}
	defer rows.Close()

	for rows.Next() {
		err := rows.Scan(&user.Email, &user.Username,
			&user.FirstName, &user.LastName,
			&user.Gender, &user.Age)
		if err != nil {
			return user, err
		}
	}

	return user, nil
}
