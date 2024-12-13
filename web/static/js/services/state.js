class State {
  constructor() {
    this.categories = []
    this.loggedin = false
  }

  setCategories(categories) {
    this.categories = categories
  }

  getCategories() {
    return this.categories
  }
}

const state = new State()
export default state
