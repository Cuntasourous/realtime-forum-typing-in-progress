## **Description**
A real-time, single-page forum built with Go, SQLite, and vanilla JavaScript. The forum includes user registration and login, post creation and commenting, and a real-time private messaging system.

This project aims to demonstrate the following:
- Full-stack development with Go and vanilla JavaScript
- Real-time communication using WebSockets
- Database manipulation with SQLite
- Single Page Application (SPA) architecture
- Handling sessions and cookies securely

---

## **Features**

### **1. Registration and Login**
- User registration with:
  - Nickname, Age, Gender, First Name, Last Name, Email, and Password
- Login with either:
  - Nickname/Email and Password
- Secure authentication using bcrypt for password hashing.
- Logout functionality accessible from any page.

---

### **2. Posts and Comments**
- **Posts**
  - Users can create posts.
  - Posts are categorized.
  - Posts are displayed in a feed view.
- **Comments**
  - Users can add comments to posts.
  - Comments are displayed when a post is clicked.

---

### **3. Private Messages**
- Real-time chat system using WebSockets.
- Features:
  - Display online/offline status of users.
  - Organize chat list by the last message sent or alphabetically if no messages exist.
  - Load and paginate chat history (10 messages at a time).
  - Messages include:
    - Timestamp of when the message was sent.
    - Username of the sender.
- Notifications for new messages in real time.

---

## **Tech Stack**
### **Frontend**
- HTML
- CSS
- Vanilla JavaScript (DOM Manipulation, WebSockets)

### **Backend**
- Go
  - Gorilla WebSocket for real-time communication
  - SQLite3 for database management
  - bcrypt for password hashing
  - UUID for unique identifiers

### **Database**
- SQLite:
  - Stores user data, posts, comments, and messages.


---

## **Getting Started**

### **1. Prerequisites**
- Go installed (`go version` >= 1.20)
- SQLite installed (`sqlite3` command available)

### **2. Installation**
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/forum-project.git
   cd forum-project
   ```
2. Install Go dependencies:
   ```bash
   go mod tidy
   ```

### **3. Running the Application**
1. Start the backend server:
    ```bash
    go run cmd/server/main.go
    ```
2. Open the frontend:
Navigate to http://localhost:8080 in your browser.

3. Using Docker:
   ```bash
   docker-compose build
   ```
    ```bash
   docker-compose up
   ```