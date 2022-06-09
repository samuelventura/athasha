import Router from "../tools/Router"
import Extractor from "./Extractor"
import Initials from "../common/Initials"
import Clone from "../tools/Clone"
import Log from "../tools/Log"

function initial() {
  const editor = Router.getEditorData()
  return {
    id: editor.id,
    type: editor.type,
    upgraded: false,
    upgrades: {},
    targeted: {},
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

function version_state(next) {
  const upgrades = Object.keys(next.upgrades).length
  const items = Object.keys(next.items).length
  if (upgrades !== items) throw `Sync error items:${items} upgrades:${upgrades}`
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
  const item = next.items[next.id]
  if (item) {
    next.item = item
    next.upgraded = next.upgrades[next.id]
    document.title = `Athasha ${item.type} Editor - ${item.name}`
  }
}

function upgrade_config(next, item) {
  //point extraction requires to ensure valid schema
  const json1 = JSON.stringify(item.config)
  item.config = Initials(item.type).merge(item.config)
  const json2 = JSON.stringify(item.config)
  next.upgrades[item.id] = json1 !== json2
  Log.log(item.id, "upgraded", next.upgrades[item.id], item.type, item.name)
}

function reducer(state, { name, args, self }) {
  //this is being called twice by react
  //deep clone required for idempotency
  args = Clone.deep(args)
  switch (name) {
    case "init": {
      const next = Clone.shallow(state)
      next.items = {}
      next.status = {}
      next.upgrades = {}
      args.items.forEach(item => {
        next.status[item.id] = {}
        next.items[item.id] = item
        upgrade_config(next, item)
      })
      next.status = build_status(args.status)
      setup_editor(next)
      update_points(next)
      return version_state(next)
    }
    case "create": {
      const next = Clone.shallow(state)
      next.items[args.id] = args
      next.status[args.id] = {}
      upgrade_config(next, args)
      update_points(next)
      return version_state(next)
    }
    case "delete": {
      const next = Clone.shallow(state)
      delete next.status[args.id]
      delete next.items[args.id]
      delete next.upgrades[args.id]
      update_points(next)
      return version_state(next)
    }
    case "edit": {
      const next = Clone.shallow(state)
      const item = next.items[args.id]
      item.config = args.config
      upgrade_config(next, item)
      update_points(next)
      if (self && args.id === next.id) {
        //remove upgraded badge on save
        next.upgraded = next.upgrades[next.id]
      }
      return version_state(next)
    }
    case "rename": {
      if (args.id !== state.id) return state
      const next = Clone.shallow(state)
      next.items[args.id].name = args.name
      return version_state(next)
    }
    case "enable": {
      if (args.id !== state.id) return state
      const next = Clone.shallow(state)
      next.items[args.id].enabled = args.enabled
      next.status[args.id] = {}
      return version_state(next)
    }
    case "status": {
      if (args.id !== state.id) return state
      const next = Clone.shallow(state)
      next.status = build_status(args)
      return version_state(next)
    }
    case "target": {
      const next = Clone.shallow(state)
      next.targeted = args
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
