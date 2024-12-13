import state from "../services/state.js"
import { handleFilter } from "../api/data-api.js"
import MainView from "./main.js"

class FilterComponent {
  constructor() {
    this.filterContainer = document.getElementById("filterContainer")
    this.categories = state.getCategories()
    console.log("categories in filter comp", this.categories)
    this.init()
  }

  init() {
    this.filterContainer.innerHTML = `
        <form id="filterForm">
          <div id="filterCategories">
          </div>
          <input type="checkbox" id="crposts" name="byUser" value="crposts">
          <label for="crposts">Created posts</label>
          <input type="checkbox" id="likeposts" name="byUser" value="likeposts">
          <label for="likeposts">Liked posts</label>
          <br>
          <button type="submit">Filter</button>
          <button type="button" id="clearButton">Clear</button>
      </form>
    `

    const filterCategories = document.getElementById("filterCategories")
    this.categories.forEach((category) => {
      filterCategories.innerHTML += `
        <input type="checkbox" id=${category.name} name="categories" value=${category.name}>
        <label for=${category.name}> ${category.name}</label>
      `
    })

    const clearButton = document.getElementById("clearButton")
    clearButton.addEventListener("click", (event) => {
      event.preventDefault()
      filterForm.reset()
    })

    const filterForm = document.getElementById("filterForm")
    filterForm.addEventListener("submit", (event) => {
      event.preventDefault()
      const form = event.target
      const formDataObject = {}

      const selectedCategories = []
      form
        .querySelectorAll('input[name="categories"]:checked')
        .forEach((checkbox) => {
          selectedCategories.push(checkbox.value)
        })
      if (selectedCategories.length !== 0) {
        formDataObject.categories = selectedCategories
      }

      const selectedByUser = []
      form
        .querySelectorAll('input[name="byUser"]:checked')
        .forEach((checkbox) => {
          selectedByUser.push(checkbox.value)
        })
      if (selectedByUser.length !== 0) {
        formDataObject.byUser = selectedByUser
      }
      console.log("filter params: ", formDataObject)
      handleFilter(formDataObject).then((result) => {
        new MainView(result)
      })
    })
  }

  showFilter() {
    this.filterContainer.style.display = "block"
  }

  hideFilter() {
    this.filterContainer.style.display = "none"
  }
}

export default FilterComponent
