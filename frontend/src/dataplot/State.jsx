import Environ from "../Environ"

function initial() {
  return {
    id: 0,
    name: "",
    config: {},
    status: {},
  }
}

function clone_object(object) {
  return Object.assign({}, object)
}

function reducer(state, { name, args, self }) {
  switch (name) {
    case "view": {
      const next = clone_object(state)
      next.id = args.id
      next.name = args.name
      next.status = {}
      next.config = args.config
      return next
    }
    case "status": {
      const next = clone_object(state)
      next.status = args
      return next
    }
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
