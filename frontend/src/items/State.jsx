import Router from "../tools/Router"
import Log from "../tools/Log"
import Types from "./Types"

function initial() {
  return {
    editor: Router.getEditorId(),
    items: {},
    status: {},
    selected: {},
    targeted: {},
    points: [],
    version: 0,
    hostname: "",
    identity: "",
    licenses: 0,
    addresses: [],
  }
}

function status(type, msg) {
  return { msg, type }
}

function clone_object(object) {
  return Object.assign({}, object)
}

function version_state(next) {
  const status = Object.keys(next.status).length
  const items = Object.keys(next.items).length
  if (status !== items) throw `Sync error items:${items} status:${status}`
  next.version++
  return next
}

function update_points(next) {
  const points = []
  function add(point) { points.push(point) }
  Object.values(next.items).forEach((item) => {
    Types.pointer(item.type)(item, add)
  })
  next.points = points
}

function setup_editor(next) {
  if (next.editor) {
    const item = next.items[next.editor]
    if (item) {
      next.targeted = {
        action: "edit",
        item
      }
      document.title = `Editor - ${item.name}`
    }
  }
}

function reducer(state, { name, args, self }) {
  switch (name) {
    case "all": {
      const next = clone_object(state)
      next.items = {}
      next.status = {}
      next.hostname = args.hostname
      next.identity = args.identity
      next.licenses = args.licenses
      next.addresses = args.addresses
      args.items.forEach(item => {
        next.status[item.id] = {}
        next.items[item.id] = item
      })
      setup_editor(next)
      update_points(next)
      return version_state(next)
    }
    case "create": {
      const next = clone_object(state)
      const item = clone_object(args)
      next.items[args.id] = item
      next.status[args.id] = {}
      if (self) {
        next.selected = item
      }
      update_points(next)
      return version_state(next)
    }
    case "delete": {
      const next = clone_object(state)
      delete next.status[args.id]
      delete next.items[args.id]
      update_points(next)
      return version_state(next)
    }
    case "rename": {
      const next = clone_object(state)
      next.items[args.id].name = args.name
      return version_state(next)
    }
    case "enable": {
      const next = clone_object(state)
      next.items[args.id].enabled = args.enabled
      next.status[args.id] = status("info", args.enabled ? "Enabled" : "Disabled")
      return version_state(next)
    }
    case "edit": {
      const next = clone_object(state)
      const item = next.items[args.id]
      item.config = args.config
      if (self) {
        next.selected = item
      }
      update_points(next)
      return version_state(next)
    }
    case "status": {
      const next = clone_object(state)
      if (next.items[args.id]) {
        next.status[args.id] = status(args.type, args.msg)
      }
      return version_state(next)
    }
    case "select": {
      const next = clone_object(state)
      next.selected = args
      return version_state(next)
    }
    case "target": {
      const next = clone_object(state)
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
