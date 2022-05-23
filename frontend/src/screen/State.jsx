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
      next.inputs = {}
      args.initial.forEach(input => {
        next.inputs[input.id] = input.value
      })
      return next
    }
    case "status": {
      const next = clone_object(state)
      next.status = args
      return next
    }
    case "input": {
      const next = clone_object(state)
      next.inputs[args.id] = args.value
      return next
    }
    case "prompt": {
      const next = clone_object(state)
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
