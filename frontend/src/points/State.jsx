import Log from "../tools/Log"

function initial() {
  return {
    id: "",
    name: "",
    type: "",
    status: {},
    names: [],
    values: {},
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
      next.type = args.type
      next.status = {}
      next.names = args.names
      next.values = {}
      args.initial.forEach(point => {
        next.values[point.name] = point.value
      })
      return next
    }
    case "status": {
      const next = clone_object(state)
      next.status = args
      return next
    }
    case "point": {
      const next = clone_object(state)
      next.values[args.name] = args.value
      return next
    }
    case "close": {
      return initial()
    }
    default:
      Log.log("Unknown mutation", name, args, self)
      return state
  }
}

const exports = { initial, reducer }

export default exports
