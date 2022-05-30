import Router from "../tools/Router"
import Extractor from "./Extractor"
import Log from "../tools/Log"

function initial() {
  return {
    id: Router.getEditorId(),
    item: {},
    items: {},
    status: {},
    inputs: [],
    outputs: [],
    version: 0,
  }
}

function build_status({ type, msg }) {
  return { msg, type }
}

function clone_shallow(object) {
  return Object.assign({}, object)
}

function version_state(next) {
  next.version++
  return next
}

function update_points(next) {
  const inputs = []
  const outputs = []
  const addInput = (point) => inputs.push(point)
  const addOutput = (point) => outputs.push(point)
  Object.values(next.items).forEach((item) => {
    Extractor.inputExtractor(item.type)(item, addInput)
    Extractor.outputExtractor(item.type)(item, addOutput)
  })
  next.inputs = inputs
  next.outputs = outputs
}

function setup_editor(next) {
  if (next.id) {
    const item = next.items[next.id]
    if (item) {
      next.item = item
      document.title = `Athasha ${item.type} Editor - ${item.name}`
    }
  }
}

function reducer(state, { name, args }) {
  switch (name) {
    case "init": {
      const next = clone_shallow(state)
      next.items = {}
      next.status = {}
      args.items.forEach(item => {
        next.status[item.id] = {}
        next.items[item.id] = item
      })
      next.status = build_status(args.status)
      setup_editor(next)
      update_points(next)
      return version_state(next)
    }
    case "create": {
      const next = clone_shallow(state)
      const item = clone_shallow(args)
      next.items[args.id] = item
      next.status[args.id] = {}
      update_points(next)
      return version_state(next)
    }
    case "delete": {
      const next = clone_shallow(state)
      delete next.status[args.id]
      delete next.items[args.id]
      update_points(next)
      return version_state(next)
    }
    case "edit": {
      const next = clone_shallow(state)
      const item = next.items[args.id]
      item.config = args.config
      update_points(next)
      return version_state(next)
    }
    case "rename": {
      if (args.id !== state.id) return state
      const next = clone_shallow(state)
      next.items[args.id].name = args.name
      return version_state(next)
    }
    case "enable": {
      if (args.id !== state.id) return state
      const next = clone_shallow(state)
      next.items[args.id].enabled = args.enabled
      next.status[args.id] = {}
      return version_state(next)
    }
    case "status": {
      if (args.id !== state.id) return state
      const next = clone_shallow(state)
      next.status = build_status(args)
      return version_state(next)
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
