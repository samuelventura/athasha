import Log from "../tools/Log"

function initial() {
  return {
    id: "",
    name: "",
    status: {},
    setts: {},
    controls: [],
    inputs: {},
    trends: {},
    prompt: {},
  }
}

function clone_shallow(object) {
  return Object.assign({}, object)
}

function reducer(state, { name, args, self }) {
  switch (name) {
    case "init": {
      const next = clone_shallow(state)
      const item = args.item
      next.id = item.id
      next.name = item.name
      next.setts = item.config.setts
      next.controls = item.config.controls
      next.status = args.status
      //idempotency: start from empty each time
      next.inputs = {}
      next.trends = {}
      const inputs = args.inputs
      Object.keys(inputs).forEach(iid => {
        const config = inputs[iid]
        next.inputs[iid] = config.value
        if (config.trend) {
          const values = Object.keys(config.values).map(key => {
            const val = config.values[key]
            const dt = Number(key)
            const del = (config.dt - dt) / 1000
            return { dt, val, del }
          })
          values.sort((v1, v2) => {
            if (v1.dt < v2.dt) return -1
            if (v1.dt > v2.dt) return +1
            return 0
          })
          next.trends[iid] = {
            dt: config.dt,
            length: config.length,
            period: config.period,
            values: values,
          }
        }
      })
      return next
    }
    case "status": {
      const next = clone_shallow(state)
      next.status = args
      return next
    }
    case "input": {
      const next = clone_shallow(state)
      next.inputs[args.id] = args.value
      const trend = next.trends[args.id]
      //idempotency: args.dt > trend.dt
      if (trend && args.dt && args.dt > trend.dt) {
        const dt = args.dt
        const val = args.value
        trend.dt = dt
        trend.value = val
        const values = trend.values
        values.push({ dt, val })
        values.forEach(e => {
          e.del = (dt - e.dt) / 1000
        })
        //keep one more since len=4 requires 5 points
        const length = trend.length / trend.period + 1
        while (values.length > length) {
          values.shift()
        }
      }
      return next
    }
    case "prompt": {
      const next = clone_shallow(state)
      next.prompt = args
      return next
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
