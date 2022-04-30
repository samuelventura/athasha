import Environ from "../Environ"

function initial() {
  return {
    id: 0,
    name: "",
    setts: {},
    controls: [],
    points: {},
    nulls: 0,
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
      next.setts = args.config.setts
      next.controls = args.config.controls
      next.points = {}
      next.nulls = 0
      args.initial.forEach(point => {
        next.points[point.id] = point.value
        if (point.value === null) {
          next.nulls++
        }
      })
      return next
    }
    case "point": {
      const next = clone_object(state)
      next.points[args.id] = args.value
      next.nulls = 0
      Object.keys(next.points).forEach(id => {
        if (next.points[id] === null) {
          next.nulls++
        }
      })
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
