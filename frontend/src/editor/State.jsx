import Router from "../tools/Router"
import Extractor from "./Extractor"
import Clone from "../tools/Clone"
import Type from "../common/Type"
import Log from "../tools/Log"

const $editor = Router.getEditorData()
const $type = Type.get($editor.type)

function initial() {
  const id = $editor.id
  const upgrades = {}
  upgrades[id] = false
  const item = $type.item(id)
  item.id = item
  const items = {}
  items[id] = item
  return {
    init: false,
    items: items,
    upgrades: upgrades,
    targeted: {},
    status: {},
    inputs: [],
    outputs: [],
    version: 0,
  }
}

function build_status({ type, msg }) {
  return { msg, type }
}

function check_version(state) {
  const upgrades = Object.keys(state.upgrades).length
  const items = Object.keys(state.items).length
  if (upgrades !== items) throw `Sync error items:${items} upgrades:${upgrades}`
  state.version++
  return state
}

function update_points(state) {
  const inputs = []
  const outputs = []
  const addInput = (point) => inputs.push(point)
  const addOutput = (point) => outputs.push(point)
  Object.values(state.items).forEach((item) => {
    Extractor.inputs(item, addInput)
    Extractor.outputs(item, addOutput)
  })
  state.inputs = inputs
  state.outputs = outputs
}

function upgrade_config(state, item) {
  //point extraction requires to ensure valid schema
  const json1 = JSON.stringify(item.config)
  item.config = Type.get(item.type).merge(item.config)
  const json2 = JSON.stringify(item.config)
  state.upgrades[item.id] = json1 !== json2
  Log.log(item.id, "upgraded", state.upgrades[item.id], item.type, item.name)
}

function reducer(state, { name, args, self }) {
  const version = state.version
  state = Clone.deep(state)
  args = Clone.deep(args)
  switch (name) {
    case "init": {
      state = initial()
      state.version = version
      state.init = true
      args.items.forEach(item => {
        state.status[item.id] = {}
        state.items[item.id] = item
        upgrade_config(state, item)
      })
      state.status = build_status(args.status)
      update_points(state)
      return check_version(state)
    }
    case "create": {
      state.items[args.id] = args
      state.status[args.id] = {}
      upgrade_config(state, args)
      update_points(state)
      return check_version(state)
    }
    case "delete": {
      delete state.status[args.id]
      delete state.items[args.id]
      delete state.upgrades[args.id]
      update_points(state)
      return check_version(state)
    }
    case "edit": {
      const item = state.items[args.id]
      item.config = args.config
      upgrade_config(state, item)
      update_points(state)
      return check_version(state)
    }
    case "rename": {
      if (args.id !== $editor.id) return state
      state.items[args.id].name = args.name
      return check_version(state)
    }
    case "enable": {
      if (args.id !== $editor.id) return state
      state.items[args.id].enabled = args.enabled
      state.status[args.id] = {}
      return check_version(state)
    }
    case "status": {
      if (args.id !== $editor.id) return state
      state.status = build_status(args)
      return check_version(state)
    }
    case "target": {
      state.targeted = args
      return check_version(state)
    }
    case "close": {
      state = initial()
      state.version = version
      return check_version(state)
    }
    default:
      Log.log("Unknown mutation", name, args, self)
      return state
  }
}

const exports = { initial, reducer, $editor, $type }

export default exports
