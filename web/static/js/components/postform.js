import state from "../services/state.js";
import { handlePost } from "../api/data-api.js";
import { showToast } from "../app.js";

class PostFormView {
  constructor() {
    this.categories = state.getCategories();
    this.view = `
        <section class="posts-section">
          <h1>Create New Post</h1>
          <div class="post-card">
            <form id="postform">
              <div class="form-group">
                <div class="flex">
                <img src="/static/images/pfp.png" alt="pfp image" class="pfp-img" width="50px" height="50px">
                    <input class="inp" name="title" id="title" maxlength="101" placeholder="Title" required></input>
                </div>
              </div>
              <br>
              <div class="form-group">
                <textarea name="content" id="content" rows="10" maxlength="2001" placeholder="What is on your mind today" required></textarea>
              </div>
              <br>
              <label>Categories:</label>
              <br>
              <div class="form-group">
                ${this.categories
                  .map(
                    (category) => `
                  <label class="lns-checkbox">
                    <input type="checkbox" name="categories" value="${category.id}">
                    <span>${category.name}</span>
                  </label>
                `
                  )
                  .join("")}
              </div>
              <button class="btn" type="submit" style="margin-top: 30px;">Submit</button>
            </form>
          </div>
        </section>
      `;
  }

  render() {
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = this.view;
    }
    // Hide the existing banner
    const banner = document.querySelector(".banner");
    if (banner) {
      banner.style.display = "none";
    }

    this.init();
  }

  init() {
    const postForm = document.getElementById("postform");
    if (postForm) {
      postForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const formDataObject = Object.fromEntries(formData.entries());

        const title = formDataObject.title.trim();
        const content = formDataObject.content.trim();

        // Validate title and content for non-empty input
        if (title === "" || content === "") {
          showToast("Post title and content cannot be empty.");
          return;
        }

        // Validate title and content length
        if (title.length > 100) {
          showToast("Title cannot exceed 100 characters.");
          return;
        }
        if (content.length > 2000) {
          showToast("Content cannot exceed 2000 characters.");
          return;
        }

        const selectedCategories = Array.from(
          form.querySelectorAll('input[name="categories"]:checked')
        ).map((checkbox) => ({
          id: parseInt(checkbox.value),
        }));

        // Display error if no categories are selected
        if (selectedCategories.length === 0) {
          showToast("Please select at least one category.");
          return;
        }

        formDataObject.title = title;
        formDataObject.content = content;
        formDataObject.categories = selectedCategories;

        try {
          const result = await handlePost(formDataObject);
          if (result.post_id) {
            window.app.router.go(`/postid=${result.post_id}`);
          } else {
            showToast(result);
          }
        } catch (error) {
          // Catch any additional errors from handlePost
          showToast(error.message);
        }
      });
    }
  }
}

export default PostFormView;
