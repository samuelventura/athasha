import Environ from "../Environ"

function initial() {
  return {
    items: {},
    selected: {},
  }
}

function status(type, msg) {
  return { msg, type }
}

function clone_object(object) {
  return Object.assign({}, object)
}

function reducer(state, { name, args, self }) {
  switch (name) {
    case "all": {
      const next = clone_object(state)
      next.items = {}
      args.items.forEach(item => {
        item.status = {}
        next.items[item.id] = item
      })
      return next
    }
    case "create": {
      const next = clone_object(state)
      const item = clone_object(args)
      item.status = {}
      next.items[args.id] = item
      if (self) {
        next.selected = item
      }
      return next
    }
    case "delete": {
      const next = clone_object(state)
      delete next.items[args.id]
      return next
    }
    case "rename": {
      const next = clone_object(state)
      next.items[args.id].name = args.name
      return next
    }
    case "enable": {
      const next = clone_object(state)
      const item = next.items[args.id]
      item.enabled = args.enabled
      item.status = status("info", args.enabled ? "Started" : "Stopped")
      return next
    }
    case "edit": {
      const next = clone_object(state)
      const item = next.items[args.id]
      item.config = args.config
      if (self) {
        next.selected = item
      }
      return next
    }
    case "status": {
      const next = clone_object(state)
      const item = next.items[args.id]
      item.status = status(args.type, args.msg)
      return next
    }
    case "select": {
      const next = clone_object(state)
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
