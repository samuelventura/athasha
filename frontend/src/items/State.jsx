import Log from "../tools/Log"
import Clone from "../tools/Clone"
import Type from "../common/Type"

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

function version_state(state) {
  const upgrades = Object.keys(state.upgrades).length
  const status = Object.keys(state.status).length
  const items = Object.keys(state.items).length
  if (status !== items) throw `Sync error items:${items} status:${status}`
  if (upgrades !== items) throw `Sync error items:${items} upgrades:${upgrades}`
  state.version++
  return state
}

function upgrade_config(state, item) {
  const json1 = JSON.stringify(item.config)
  item.config = Type.get(item.type).merge(item.config)
  const json2 = JSON.stringify(item.config)
  const upgraded = json1 !== json2
  state.upgrades[item.id] = upgraded
  Log.log(item.id, "upgraded", upgraded, item.type, item.name)
}

function reducer(state, { name, args, self }) {
  state = Clone.deep(state)
  args = Clone.deep(args)
  switch (name) {
    case "init": {
      state.items = {}
      state.status = {}
      state.upgrades = {}
      state.hostname = args.hostname
      state.identity = args.identity
      state.licenses = args.licenses
      state.addresses = args.addresses
      args.items.forEach(item => {
        state.status[item.id] = {}
        state.items[item.id] = item
        upgrade_config(state, item)
      })
      args.status.forEach(status => {
        state.status[status.id] = build_status(status)
      })
      return version_state(state)
    }
    case "create": {
      state.items[args.id] = args.item
      state.status[args.id] = {}
      if (self) {
        state.selected = args.item
      }
      upgrade_config(state, args.item)
      return version_state(state)
    }
    case "edit": {
      state.items[args.id] = args.item
      upgrade_config(state, args.item)
      return version_state(state)
    }
    case "rename": {
      state.items[args.id] = args.item
      return version_state(state)
    }
    case "enable": {
      state.items[args.id] = args.item
      state.status[args.id] = {}
      return version_state(state)
    }
    case "delete": {
      delete state.status[args.id]
      delete state.items[args.id]
      delete state.upgrades[args.id]
      return version_state(state)
    }
    case "status": {
      if (state.items[args.id]) {
        state.status[args.id] = build_status(args)
      }
      return version_state(state)
    }
    case "select": {
      state.selected = args
      return version_state(state)
    }
    case "target": {
      state.targeted = args
      return version_state(state)
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
