import Log from "../tools/Log"
import Initials from "../common/Initials"

function initial() {
  return {
    items: {},
    status: {},
    upgrades: {},
    selected: {},
    targeted: {},
    version: 0,
    hostname: "",
    identity: "",
    licenses: 0,
    addresses: [],
  }
}

function build_status({ type, msg }) {
  return { msg, type }
}

function clone_shallow(object) {
  return Object.assign({}, object)
}

function clone_deep(object) {
  return JSON.parse(JSON.stringify(object))
}

function version_state(next) {
  const upgrades = Object.keys(next.upgrades).length
  const status = Object.keys(next.status).length
  const items = Object.keys(next.items).length
  if (status !== items) throw `Sync error items:${items} status:${status}`
  if (upgrades !== items) throw `Sync error items:${items} upgrades:${upgrades}`
  next.version++
  return next
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
  args = clone_deep(args)
  switch (name) {
    case "init": {
      const next = clone_shallow(state)
      next.items = {}
      next.status = {}
      next.upgrades = {}
      next.hostname = args.hostname
      next.identity = args.identity
      next.licenses = args.licenses
      next.addresses = args.addresses
      args.items.forEach(item => {
        next.status[item.id] = {}
        next.items[item.id] = item
        upgrade_config(next, item)
      })
      args.status.forEach(status => {
        next.status[status.id] = build_status(status)
      })
      return version_state(next)
    }
    case "create": {
      const next = clone_shallow(state)
      next.items[args.id] = args.item
      next.status[args.id] = {}
      if (self) {
        next.selected = args.item
      }
      upgrade_config(next, args.item)
      return version_state(next)
    }
    case "edit": {
      const next = clone_shallow(state)
      next.items[args.id] = args.item
      upgrade_config(next, args.item)
      return version_state(next)
    }
    case "rename": {
      const next = clone_shallow(state)
      next.items[args.id] = args.item
      return version_state(next)
    }
    case "enable": {
      const next = clone_shallow(state)
      next.items[args.id] = args.item
      next.status[args.id] = {}
      return version_state(next)
    }
    case "delete": {
      const next = clone_shallow(state)
      delete next.status[args.id]
      delete next.items[args.id]
      delete next.upgrades[args.id]
      return version_state(next)
    }
    case "status": {
      const next = clone_shallow(state)
      if (next.items[args.id]) {
        next.status[args.id] = build_status(args)
      }
      return version_state(next)
    }
    case "select": {
      const next = clone_shallow(state)
      next.selected = args
      return version_state(next)
    }
    case "target": {
      const next = clone_shallow(state)
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
