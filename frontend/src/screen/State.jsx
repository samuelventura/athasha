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
      const item = args.item
      next.id = item.id
      next.name = item.name
      next.setts = item.config.setts
      next.controls = item.config.controls
      next.status = args.status
      next.inputs = {}
      const inputs = args.inputs
      Object.keys(inputs).forEach(iid => {
        const config = inputs[iid]
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
