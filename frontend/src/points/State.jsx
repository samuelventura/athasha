import Log from "../tools/Log"

function initial() {
  return {
    id: "",
    name: "",
    type: "",
    status: {},
    inames: [],
    itypes: [],
    ivalues: {},
    onames: [],
    otypes: [],
    ovalues: {},
    values: {},
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
      next.type = args.type
      next.status = args.status
      next.inames = args.inames
      next.onames = args.onames
      next.itypes = args.itypes
      next.otypes = args.otypes
      next.ivalues = {}
      next.ovalues = {}
      args.inames.forEach((n, i) => {
        next.itypes = next.itypes ? next.itypes : []
        if (i >= next.itypes.length) next.itypes.push(null)
      })
      args.onames.forEach((n, i) => {
        next.otypes = next.otypes ? next.otypes : []
        if (i >= next.otypes.length) next.otypes.push(null)
      })
      args.ivalues.forEach(point => {
        next.ivalues[point.name] = point.value
      })
      args.ovalues.forEach(point => {
        next.ovalues[point.name] = point.value
        //explicit initialization to avoid
        //mobile unsolicited writes
        next.values[point.name] = ""
      })
      return next
    }
    case "status": {
      const next = clone_shallow(state)
      next.status = args
      return next
    }
    case "value": {
      const next = clone_shallow(state)
      next.values[args.name] = args.value
      return next
    }
    case "input": {
      const next = clone_shallow(state)
      next.ivalues[args.name] = args.value
      return next
    }
    case "output": {
      const next = clone_shallow(state)
      next.ovalues[args.name] = args.value
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
