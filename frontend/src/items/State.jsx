import Environ from "../Environ"

function initial() {
  return {
    items: {},
    status: {},
    selected: {},
    version: 0,
    hostname: "",
    identity: "",
    licenses: 0,
    ips: [],
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

function reducer(state, { name, args, self }) {
  switch (name) {
    case "all": {
      const next = clone_object(state)
      next.items = {}
      next.status = {}
      next.hostname = args.hostname
      next.identity = args.identity
      next.licenses = args.licenses
      next.ips = args.ips
      args.items.forEach(item => {
        next.status[item.id] = {}
        next.items[item.id] = item
      })
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
      return version_state(next)
    }
    case "delete": {
      const next = clone_object(state)
      delete next.status[args.id]
      delete next.items[args.id]
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
