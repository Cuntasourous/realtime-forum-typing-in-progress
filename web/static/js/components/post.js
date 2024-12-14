import { getPosts, handleAddComment, handleLike } from "../api/data-api.js";
import { showToast } from "../app.js"; // Ensure showToast is imported correctly

class PostView {
  constructor(postID) {
    this.postID = postID;
    this.data;
    this.getData();
    this.view = `
            <div class="post-card">
                <h2 id="titleP"></h2>
                <div class="post-meta">
                            <p id="user" class="user"></p>
                            <p id="date" class="date"></p>
                            <br>
                        </div>
                        <div class="categories">           
                        </div>
                        <p id="content" class="content"></p> 
                </div>
            </div>
            <div class="comment-section">
                <form id="addcomment">
                    <textarea name="content" rows="5" cols="50" maxlength="501" placeholder="Start typing here" required></textarea>
                    <br>
                    <button type="submit" class="btn">Post</button>
                </form>
            </div>
        `;
  }

  async getData() {
    try {
      const postData = await getPosts(this.postID);
      this.data = postData;
      this.render();
    } catch (err) {
      console.log("Error fetching post: ", err);
      window.app.router.go("/404"); // Redirect to a 404 page
    }
  }

  render() {
    const root = document.getElementById("root");
    root.innerHTML = this.view;
    if (root) {
      // Render post data
      const title = document.getElementById("titleP");
      const user = document.getElementById("user");
      const date = document.getElementById("date");
      const content = document.getElementById("content");
      const categories = document.querySelector(".categories");
      title.innerHTML = this.data.post[0].title;
      user.innerHTML = this.data.post[0].username;
      date.innerHTML = this.data.post[0].created_at;
      content.innerHTML = this.data.post[0].content;

      // Render categories
      this.data.post[0].categories.forEach((category) => {
        const categoryElement = document.createElement("span");
        categoryElement.innerHTML = category.name;
        categories.appendChild(categoryElement);
      });

      // Add comment form handler
      const addCommentForm = document.getElementById("addcomment");
      addCommentForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const commentContent = event.target.content.value.trim();

        // Validate comment content for non-empty and length
        if (commentContent === "") {
          showToast("Comment cannot be empty.");
          return;
        }
        if (commentContent.length > 500) {
          showToast("Comment cannot exceed 500 characters.");
          return;
        }

        try {
          await handleAddComment(event, this.postID);
          this.getData(); // Reload post data to include the new comment
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
        } catch (err) {
          showToast(err.message || "Failed to add comment");
        }
      });

      // Render comments
      if (this.data.comments) {
        this.data.comments.forEach((comment) => {
          const commentCard = document.createElement("div");
          commentCard.className = "comment-single";
          commentCard.innerHTML = `
              <div class="line"></div>
              <div class="comment-card">
                    <div class="post-meta">
                        <p class="user">${comment.username}</p>
                    </div>
                    <p class="date" style="margin-bottom: 15px;">${comment.created_at}</p>
                    <p class="content">${comment.content}</p> 
                    <div class="interaction">
                      <button id=${comment.id} class="like-button"></button>
                      <span class="like-count">${comment.likes}</span>
                      <button id=${comment.id} class="dislike-button"></button>
                      <span class="dislike-count">${comment.dislikes}</span>
                    </div>
              </div>
            </div>
            `;
          root.appendChild(commentCard);
        });

        // Add event listeners for like/dislike buttons
        const likeButtons = document.querySelectorAll(".like-button");
        const dislikeButtons = document.querySelectorAll(".dislike-button");

        likeButtons.forEach((button) => {
          button.addEventListener("click", (event) => {
            handleLike("comment", event.target.id, "like").then((result) => {
              const likeCount = event.target.nextElementSibling;
              const dislikeCount =
                event.target.nextElementSibling.nextElementSibling.nextElementSibling;
              likeCount.innerText = `${result.likes}`;
              dislikeCount.innerText = `${result.dislikes}`;
            });
          });
        });

        dislikeButtons.forEach((button) => {
          button.addEventListener("click", (event) => {
            handleLike("comment", event.target.id, "dislike").then((result) => {
              const dislikeCount = event.target.nextElementSibling;
              const likeCount = event.target.previousElementSibling;
              dislikeCount.innerText = `${result.dislikes}`;
              likeCount.innerText = `${result.likes}`;
            });
          });
        });
      }
    }
  }
}

export default PostView;
