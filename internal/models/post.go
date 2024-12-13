package models

type Post struct {
	ID         int        `json:"id"`
	UserID     int        `json:"user_id"`
	Title      string     `json:"title"`
	Content    string     `json:"content"`
	CreatedAt  string     `json:"created_at"`
	Username   string     `json:"username"`
	Likes      int        `json:"likes"`
	Dislikes   int        `json:"dislikes"`
	Categories []Category `json:"categories"`
}
