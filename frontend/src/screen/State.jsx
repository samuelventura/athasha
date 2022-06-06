import Log from "../tools/Log"

function initial() {
  return {
    id: "",
    name: "",
    status: {},
    setts: {},
    controls: [],
    inputs: {},
    prompt: {},
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
      next.setts = args.config.setts
      next.controls = args.config.controls
      next.inputs = {}
      Object.keys(args.initial).forEach(iid => {
        const config = args.initial[iid]
        next.inputs[iid] = config.value
      })
      return next
    }
    case "status": {
      const next = clone_shallow(state)
      next.status = args
      return next
    }
    case "input": {
      const next = clone_shallow(state)
      next.inputs[args.id] = args.value
      return next
    }
    case "prompt": {
      const next = clone_shallow(state)
      next.prompt = args
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
