const POSTURL = "http://localhost:8080/api/post";
const COMMENTURL = "http://localhost:8080/api/comment";
const LIKEURL = "http://localhost:8080/api/like";
const FILTERURL = "http://localhost:8080/api/filter";
const CATURL = "http://localhost:8080/api/categories";
const USERSURL = "http://localhost:8080/api/users";
const MSGURL = "http://localhost:8080/api/messages";
const USERURL = "http://localhost:8080/api/user";
const ORDERURL = "http://localhost:8080/api/chatorder";

import { showToast } from "../app.js";


// Helper function to handle errors and display via showToast
function handleError(message) {
  showToast(message);
  throw new Error(message);
}

// new get request for chat messages order (name of function getChatOrder)
export async function getChatOrder(userId) {
  console.log("getChatOrder called");
  try {
    const response = await fetch(`${ORDERURL}?id=${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    console.log("result from chat order", result);
    if (response.ok) {
      return result.data;
    } else {
      handleError(result.message || "Failed to retrieve chat order");
    }
  } catch (error) {
    handleError("An error occurred while fetching chat order");
  }
}

export async function getPosts(postID = "") {
  let urlpost = POSTURL;
  if (postID !== "") {
    urlpost += "?id=" + postID;
  }

  try {
    const res = await fetch(urlpost, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();
    if (res.ok) {
      return result.data;
    } else {
      handleError(result.message || "Failed to retrieve posts");
    }
  } catch (error) {
    handleError("An error occurred while fetching posts");
  }
}

export async function handlePost(postData) {
  try {
    const response = await fetch(POSTURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    const result = await response.json();
    if (response.ok) {
      return result.data;
    } else {
      // Handle specific error messages from the server
      switch (result.message) {
        case "Login required to create posts":
          handleError("Please log in to create a post.");
          break;
        case "Title and content cannot be empty":
          handleError("Post title and content cannot be empty.");
          break;
        case "Failed to create post":
          handleError("An error occurred while creating the post.");
          break;
        default:
          handleError(result.message || "Failed to add post");
      }
    }
  } catch (error) {
    handleError("An error occurred while adding a post");
  }
}

export async function handleLike(entityType, entityId, likeType) {
  try {
    const response = await fetch(LIKEURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: likeType, id: parseInt(entityId), entityType }),
    });

    const result = await response.json();
    if (response.ok) {
      return result.data;
    } else {
      handleError(result.message || "Failed to add like");
    }
  } catch (error) {
    handleError("An error occurred while adding a like");
  }
}

export async function handleAddComment(event, postId) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const formDataObject = Object.fromEntries(formData.entries());
  formDataObject.post_id = postId;

  try {
    const response = await fetch(COMMENTURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formDataObject),
    });

    const result = await response.json();
    if (response.ok) {
      return true;
    } else {
      handleError(result.message || "Failed to add comment");
    }
  } catch (error) {
    handleError("An error occurred while adding a comment");
  }
}

export async function handleFilter(filterParams) {
  try {
    const res = await fetch(FILTERURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filterParams),
    });

    const result = await res.json();
    if (res.ok) {
      return result.data;
    } else {
      handleError(result.message || "Failed to retrieve filtered posts");
    }
  } catch (error) {
    handleError("An error occurred while applying filters");
  }
}

export async function handleCategories() {
  try {
    const response = await fetch(CATURL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    if (response.ok) {
      return result.data;
    } else {
      switch (result.message) {
        case "Failed to retrieve categories":
          handleError("An error occurred while fetching categories.");
          break;
        default:
          handleError(result.message || "Failed to get categories");
      }
    }
  } catch (error) {
    handleError("An error occurred while fetching categories");
  }
}

export async function handleUsers() {
  try {
    const response = await fetch(USERSURL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    if (response.ok) {
      return result.data;
    } else {
      handleError(result.message || "Failed to retrieve users");
    }
  } catch (error) {
    handleError("An error occurred while fetching users");
  }
}

export async function handleMessage(senderId, receiverId) {
  try {
    const response = await fetch(`${MSGURL}?sender=${senderId}&receiver=${receiverId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    if (response.ok) {
      return result.data || []; // Return empty array if data is null
    } else {
      handleError(result.message || "Failed to retrieve messages");
    }
  } catch (error) {
    handleError("An error occurred while fetching messages");
  }
}

export async function handleUser(userId) {
  const url = `${USERURL}?userId=${userId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    if (response.ok) {
      return result.data;
    } else {
      handleError(result.message || "Failed to retrieve user information");
    }
  } catch (error) {
    handleError("An error occurred while fetching user information");
  }
}

export async function handleGetPostWithComments(postID) {
  try {
    const url = `${POSTURL}?id=${postID}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    if (response.ok) {
      return result.data;
    } else {
      switch (result.message) {
        case "Invalid post ID format":
          handleError("The provided post ID format is invalid.");
          break;
        case "Failed to retrieve post":
          handleError("An error occurred while retrieving the post.");
          break;
        case "Failed to retrieve comments":
          handleError("An error occurred while retrieving the comments.");
          break;
        default:
          handleError(result.message || "Failed to retrieve post with comments");
      }
    }
  } catch (error) {
    handleError("An error occurred while fetching the post and comments");
  }
}
