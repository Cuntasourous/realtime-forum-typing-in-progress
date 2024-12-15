import { getPosts, handleLike } from "../api/data-api.js"
import FilterComponent from "./filter.js"

class MainView {
  constructor(data = {}) {
    console.log("posts for main view: ", data)
    this.data
    if (data && data.posts) {
      // posts from filter params
      this.data = data
      console.log("posts of this.data: ", this.data)
      this.render()
    } else {
      this.getData()
    }
  }

  getData() {
    getPosts().then((posts) => {
      this.data = posts
      this.render()
    })
  }

  render() {
    console.log("rendering main view")
    let root = document.getElementById("root")
    root.innerHTML = ""
    let bannerDiv = document.createElement("div")
    bannerDiv.classList.add("banner")

    // Create the "Create Post" link
    let createPostLink = document.createElement("a")
    createPostLink.href = "/postform"
    createPostLink.id = "createLink"
    createPostLink.innerText = "Create Post"
    bannerDiv.appendChild(createPostLink)

    // Create the filter button
    let filterButton = document.createElement("a");
    filterButton.href = ""
    filterButton.innerText = "Filter";
    filterButton.id = "filterLink"
    filterButton.addEventListener("click", () => {
      filterComponent.showFilter();
    });
    bannerDiv.appendChild(filterButton);

    root.appendChild(bannerDiv);

    const filterlink = document.getElementById("filterLink")
    const filterContainer = document.getElementById("filterContainer")
    if (filterContainer) {
      filterContainer.style.display = "none"
    }
    let filterState = false
    if (filterlink) {
      const filterComponent = new FilterComponent()
      filterlink.addEventListener("click", (event) => {
        event.preventDefault()
        if (filterState) {
          console.log("hide filter")
          filterComponent.hideFilter()
          filterState = !filterState
        } else {
          console.log("show filter")
          filterComponent.showFilter()
          filterState = !filterState
        }
      })
    }
    
    //posts
    let section = document.createElement("section")
    section.classList.add("posts-section")
    root.appendChild(section)
    this.data.posts.forEach((post) => {
      let postLink = document.createElement("a")
      postLink.href = `/postid=${post.id}`
      postLink.classList.add("post-link")

      let article = document.createElement("article")
      article.classList.add("post-card")

      let postDiv = document.createElement("div")
      postDiv.id = `post-${post.id}`

      let title = document.createElement("h2")
      title.innerText = post.title

      let postMeta = document.createElement("div")
      postMeta.classList.add("post-meta")

      let user = document.createElement("p")
      user.classList.add("user")
      user.innerText = post.username

      let date = document.createElement("p")
      date.classList.add("date")
      date.innerText = post.created_at

      let categoriesDiv = document.createElement("div")
      categoriesDiv.classList.add("categories")
      post.categories.forEach((category) => {
        let categorySpan = document.createElement("span")
        categorySpan.innerText = category.name
        categoriesDiv.appendChild(categorySpan)
      })

      let content = document.createElement("p")
      content.classList.add("content")
      content.innerText = post.content

      // div contains the comment button, like button, dislike button, like count, dislike count

      let intDiv = document.createElement("div")
      intDiv.classList.add("interaction")

      // let commentButton = document.createElement("a")
      // commentButton.href = `/postid=${post.id}`
      // commentButton.classList.add("button", "comment-button")
      // commentButton.innerText = "Add comment"

      let likeButton = document.createElement("button")
      likeButton.id = post.id
      likeButton.classList.add("like-button")
      // likeButton.innerText = "Like"

      let likeCount = document.createElement("span")
      likeCount.classList.add("like-count")
      likeCount.innerText = post.likes

      let dislikeButton = document.createElement("button")
      dislikeButton.id = post.id
      dislikeButton.classList.add("dislike-button")
      // dislikeButton.innerText = "Dislike"

      let dislikeCount = document.createElement("span")
      dislikeCount.classList.add("dislike-count")
      dislikeCount.innerText = post.dislikes

      postMeta.appendChild(user)
      postMeta.appendChild(date)
      postDiv.appendChild(title)
      postDiv.appendChild(postMeta)
      postDiv.appendChild(categoriesDiv)
      postDiv.appendChild(content)
      // intDiv.appendChild(commentButton)
      intDiv.appendChild(likeButton)
      intDiv.appendChild(likeCount)
      intDiv.appendChild(dislikeButton)
      intDiv.appendChild(dislikeCount)
      postDiv.appendChild(intDiv)
      article.appendChild(postDiv)
      postLink.appendChild(article)
      section.appendChild(postLink)
    })
    this.init()
  }

  init() {
    const likeButtons = document.querySelectorAll(".like-button")
    const dislikeButtons = document.querySelectorAll(".dislike-button")
    likeButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault()
        event.stopPropagation()
        console.log(`Like button clicked for post ID: ${event.target.id}`)
        handleLike("post", event.target.id, "like").then((result) => {
          const likeCount = document.querySelector(
            `#post-${event.target.id} .like-count`
          )
          likeCount.innerText = `${result.likes}`
          const dislikeCount = document.querySelector(
            `#post-${event.target.id} .dislike-count`
          )
          dislikeCount.innerText = `${result.dislikes}`
        })
      })
    })
    dislikeButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault()
        event.stopPropagation() // important to prevent the event from bubbling up to the parent element which is a anchor tag
        console.log(`Dislike button clicked for post ID: ${event.target.id}`)
        handleLike("post", event.target.id, "dislike").then((result) => {
          const likeCount = document.querySelector(
            `#post-${event.target.id} .like-count`
          )
          likeCount.innerText = `${result.likes}`
          const dislikeCount = document.querySelector(
            `#post-${event.target.id} .dislike-count`
          )
          dislikeCount.innerText = `${result.dislikes}`
        })
      })
    })

    const postLinks = document.querySelectorAll(".post-link")
    postLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault()
        const route = link.getAttribute("href")
        window.app.router.go(route)
      })
    })
  }
}

export default MainView
