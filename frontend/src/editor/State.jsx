import Router from "../tools/Router"
import Extractor from "./Extractor"
import Clone from "../tools/Clone"
import Type from "../common/Type"
import Log from "../tools/Log"
import Encode from "../tools/Encode"
import stringify from 'json-stable-stringify'

const $editor = Router.getEditorData()
const $type = Type.get($editor.type)

function hash(config) {
  return Encode.SHA1(stringify(config))
}

function initial() {
  const item = $type.item("Default")
  item.id = $editor.id
  return {
    init: false,
    item: item,
    dirty: false,
    items: {},
    upgrades: {},
    status: {},
    inputs: [],
    outputs: [],
    targeted: {},
    version: 0,
  }
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
        state.items[item.id] = item
        upgrade_config(state, item)
        if (item.id === $editor.id) {
          state.item = Clone.deep(item)
        }
      })
      update_points(state)
      return check_version(state)
    }
    case "create": {
      state.items[args.id] = args
      upgrade_config(state, args)
      update_points(state)
      return check_version(state)
    }
    case "delete": {
      delete state.items[args.id]
      delete state.upgrades[args.id]
      update_points(state)
      return check_version(state)
    }
    case "edit": {
      const item = state.items[args.id]
      item.config = args.config
      upgrade_config(state, item)
      //to remove dirty flag
      if (args.id === $editor.id) {
        if (self) {
          const config = Clone.deep(args.config)
          state.item.config = config
        }
      }
      update_points(state)
      return check_version(state)
    }
    case "rename": {
      if (args.id !== $editor.id) return state
      state.item.name = args.name
      return check_version(state)
    }
    case "enable": {
      if (args.id !== $editor.id) return state
      state.item.enabled = args.enabled
      return check_version(state)
    }
    case "status": {
      if (args.id !== $editor.id) return state
      state.status = args
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

const exports = { initial, reducer, hash, $editor, $type }

export default exports
