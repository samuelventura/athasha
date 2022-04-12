import Environ from "../Environ"

function initial() {
  return {
    items: {},
    selected: {},
  }
}

function reducer(state, { name, args, self }) {
  switch (name) {
    case "all": {
      const next = Object.assign({}, state)
      next.items = {}
      args.items.forEach(i => next.items[i.id] = i)
      return next
    }
    case "create": {
      const next = Object.assign({}, state)
      next.items[args.id] = args.item
      if (self) {
        next.selected = args.item
      }
      return next
    }
    case "delete": {
      const next = Object.assign({}, state)
      delete next.items[args.id]
      return next
    }
    case "rename": {
      const next = Object.assign({}, state)
      next.items[args.id].name = args.name
      return next
    }
    case "enable": {
      const next = Object.assign({}, state)
      next.items[args.id].enabled = args.enabled
      return next
    }
    case "select": {
      const next = Object.assign({}, state)
      next.selected = args
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
