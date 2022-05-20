import Log from "../tools/Log"

function initial() {
  return {
    id: 0,
    name: "",
    status: {},
    setts: {},
    controls: [],
    points: {},
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
      next.setts = args.config.setts
      next.controls = args.config.controls
      next.points = {}
      args.initial.forEach(point => {
        next.points[point.id] = point.value
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
      next.points[args.id] = args.value
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
