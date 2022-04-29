import Environ from "../Environ"

function initial() {
  return {
    items: {},
    selected: {},
  }
}

function reducer(state, { name, args, self }) {
  switch (name) {
    case "close": {
      return initial()
    }
    default:
      Environ.log("Unknown mutation", name, args, self)
      return state
  }
}

const exports = { initial, reducer }

export default exports
