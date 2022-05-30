import Log from "../tools/Log"

function initial() {
  return {
    items: {},
    status: {},
    selected: {},
    created: {},
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

function version_state(next) {
  const status = Object.keys(next.status).length
  const items = Object.keys(next.items).length
  if (status !== items) throw `Sync error items:${items} status:${status}`
  next.version++
  return next
}

function reducer(state, { name, args, self, restore, clone }) {
  switch (name) {
    case "init": {
      const next = clone_shallow(state)
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
      if (self && !restore && !clone) {
        //auto open disabled
        //next.created = args.item
      }
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
      return version_state(next)
    }
    case "status": {
      const next = clone_shallow(state)
      if (next.items[args.id]) {
        next.status[args.id] = build_status(args)
      }
      return version_state(next)
    }
    case "created": {
      const next = clone_shallow(state)
      next.created = args
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
