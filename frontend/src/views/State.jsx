import Log from "../tools/Log"

function initial() {
  return {
    items: {},
    status: {},
    version: 0,
    addresses: [],
  }
}

function build_status(type, msg) {
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
    case "init": {
      const next = clone_object(state)
      next.items = {}
      next.status = {}
      next.addresses = args.addresses
      args.items.forEach(item => {
        next.status[item.id] = {}
        next.items[item.id] = item
      })
      args.status.forEach(status => {
        next.status[status.id] = build_status(status.type, status.msg)
      })
      return version_state(next)
    }
    case "create": {
      const next = clone_object(state)
      next.items[args.id] = args.item
      next.status[args.id] = {}
      return version_state(next)
    }
    case "rename":
    case "enable": {
      const next = clone_object(state)
      next.items[args.id] = args.item
      return version_state(next)
    }
    case "delete": {
      const next = clone_object(state)
      delete next.status[args.id]
      delete next.items[args.id]
      return version_state(next)
    }
    case "status": {
      const next = clone_object(state)
      if (next.items[args.id]) {
        next.status[args.id] = build_status(args.type, args.msg)
      }
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
