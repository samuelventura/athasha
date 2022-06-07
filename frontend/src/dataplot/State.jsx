import Log from "../tools/Log"

function initial() {
  return {
    id: "",
    name: "",
    config: { setts: { ymin: 0, ymax: 100, lineWidth: 1, ywidth: 60 }, columns: [{ name: "" }] },
    status: {},
    data: [],
    version: 0,
  }
}

function clone_shallow(object) {
  return Object.assign({}, object)
}

function reducer(state, { name, args, self }) {
  switch (name) {
    case "init": {
      const next = clone_shallow(state)
      next.id = args.id
      next.name = args.name
      next.status = args.status
      next.config = args.config
      return next
    }
    case "status": {
      const next = clone_shallow(state)
      next.status = args
      return next
    }
    case "data": {
      const next = clone_shallow(state)
      next.data = args
      next.version++
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
