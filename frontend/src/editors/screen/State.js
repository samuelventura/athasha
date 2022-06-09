import Log from "../../tools/Log"
import { v4 as uuidv4 } from 'uuid'

function initial() {
    return {
        version: 0,
        selected: null,
        controls: [],
        indexes: {},
        setts: {},
        multi: [],
    }
}

function clone_deep(obj) {
    return structuredClone(obj)
}

function clone_state(obj) {
    return clone_deep(obj)
}

function update_indexes(next) {
    next.controls.forEach((control, index) => {
        const id = control.id
        next.indexes[id] = index
    })
}

function version_check(next, cmd) {
    const clen = next.controls.length
    const ilen = Object.keys(next.indexes).length
    if (clen !== ilen) throw `Length mismatch ${clen} ${ilen} after ${cmd}`
    next.version++
}

function moduleIndex(next, index) {
    const total = next.controls.length
    return (index + total) % total
}

function rangeValue(curr, inc, min, max, size) {
    const upper = Number(max) - Number(size)
    const value = Number(curr) + inc
    const trimmed = Math.max(min, Math.min(upper, value))
    return trimmed.toString()
}

function reducer(state, { name, args }) {
    console.log("reducer", name, args)
    const cmd = { name, args }
    args = clone_deep(args)
    switch (name) {
        case "init": {
            const next = initial()
            next.controls = args.controls
            next.setts = args.setts
            update_indexes(next)
            version_check(next, cmd)
            return next
        }
        case "select": {
            const next = clone_state(state)
            next.selected = args.id
            return next
        }
        case "multi": {
            const next = clone_state(state)
            next.multi = args.ids || []
            return next
        }
        case "setts": {
            const next = clone_state(state)
            next.setts[args.name] = args.value
            version_check(next, cmd)
            return next
        }
        case "control-setts": {
            const next = clone_state(state)
            const index = next.indexes[args.id]
            const control = next.controls[index]
            control.setts[args.name] = args.value
            version_check(next, cmd)
            return next
        }
        case "control-data": {
            const next = clone_state(state)
            const index = next.indexes[args.id]
            const control = next.controls[index]
            control.data[args.name] = args.value
            version_check(next, cmd)
            return next
        }
        case "control-add": {
            const next = clone_state(state)
            const control = args.control
            const index = next.controls.length
            next.controls.push(control)
            next.indexes[control.id] = index
            next.selected = control.id
            version_check(next, cmd)
            return next
        }
        case "control-del": {
            const next = clone_state(state)
            const index = next.indexes[args.id]
            delete next.indexes[args.id]
            next.controls.splice(index, 1)
            if (next.selected === args.id) {
                next.selected = null
            }
            next.multi = next.multi.filter(id => id !== args.id)
            update_indexes(next)
            version_check(next, cmd)
            return next
        }
        case "control-up": {
            const next = clone_state(state)
            const index = next.indexes[args.id]
            const control = next.controls[index]
            next.controls.splice(index, 1)
            const module = moduleIndex(next, index + 1)
            next.splice(module, 0, control)
            update_indexes(next)
            version_check(next, cmd)
            return next
        }
        case "control-down": {
            const next = clone_state(state)
            const index = next.indexes[args.id]
            const control = next.controls[index]
            next.controls.splice(index, 1)
            const module = moduleIndex(next, index - 1)
            next.splice(module, 0, control)
            update_indexes(next)
            version_check(next, cmd)
            return next
        }
        case "control-top": {
            const next = clone_state(state)
            const index = next.indexes[args.id]
            const control = next.controls[index]
            const length = next.controls.length
            next.controls.splice(index, 1)
            next.splice(length, 0, control)
            update_indexes(next)
            version_check(next, cmd)
            return next
        }
        case "control-bottom": {
            const next = clone_state(state)
            const index = next.indexes[args.id]
            const control = next.controls[index]
            next.controls.splice(index, 1)
            next.splice(0, 0, control)
            update_indexes(next)
            version_check(next, cmd)
            return next
        }
        default:
            Log.log("Unknown mutation", name, args)
            return state
    }
}

const init = (ctx, setts, controls) => ctx.dispatch({ name: "init", args: { setts, controls } })
const setMulti = (ctx, ids) => ctx.dispatch({ name: "multi", args: { ids } })
const setSelected = (ctx, id) => ctx.dispatch({ name: "select", args: { id } })
const setSetts = (ctx, name, value) => ctx.dispatch({ name: "setts", args: { name, value } })
const setControlSetts = (ctx, id, name, value) => ctx.dispatch({ name: "control-setts", args: { id, name, value } })
const setControlData = (ctx, id, name, value) => ctx.dispatch({ name: "control-data", args: { id, name, value } })
const addControl = (ctx, control, select) => ctx.dispatch({ name: "control-add", args: { control, select } })
const actionControl = (ctx, id, action) => {
    const state = ctx.state
    const setts = state.setts
    const index = state.indexes[id]
    const control = state.controls[index]
    const csetts = control.setts
    switch (action) {
        case "clone": {
            const clone = clone_deep(control)
            clone.id = uuidv4()
            ctx.dispatch({ name: "control-add", args: { control: clone } })
            break
        }
        case "del": {
            ctx.dispatch({ name: "control-del", args: { id } })
            break
        }
        case "up": {
            ctx.dispatch({ name: "control-up", args: { id } })
            break
        }
        case "down": {
            ctx.dispatch({ name: "control-down", args: { id } })
            break
        }
        case "top": {
            ctx.dispatch({ name: "control-top", args: { id } })
            break
        }
        case "bottom": {
            ctx.dispatch({ name: "control-bottom", args: { id } })
            break
        }
        case "xdec": {
            const value = rangeValue(csetts.posX, -1, 0, setts.gridX, csetts.width)
            setControlSetts(ctx, id, "posX", value)
            break
        }
        case "xdec10": {
            const value = rangeValue(csetts.posX, -10, 0, setts.gridX, csetts.width)
            setControlSetts(ctx, id, "posX", value)
            break
        }
        case "xinc": {
            const value = rangeValue(csetts.posX, +1, 0, setts.gridX, csetts.width)
            setControlSetts(ctx, id, "posX", value)
            break
        }
        case "xinc10": {
            const value = rangeValue(csetts.posX, +10, 0, setts.gridX, csetts.width)
            setControlSetts(ctx, id, "posX", value)
            break
        }
        case "ydec": {
            const value = rangeValue(csetts.posY, -1, 0, setts.gridY, csetts.height)
            setControlSetts(ctx, id, "posY", value)
            break
        }
        case "ydec10": {
            const value = rangeValue(csetts.posY, -10, 0, setts.gridY, csetts.height)
            setControlSetts(ctx, id, "posY", value)
            break
        }
        case "yinc": {
            const value = rangeValue(csetts.posY, +1, 0, setts.gridY, csetts.height)
            setControlSetts(ctx, id, "posY", value)
            break
        }
        case "yinc10": {
            const value = rangeValue(csetts.posY, +10, 0, setts.gridY, csetts.height)
            setControlSetts(ctx, id, "posY", value)
            break
        }
        case "wdec": {
            const value = rangeValue(csetts.width, -1, 1, setts.gridX, csetts.posX)
            setControlSetts(ctx, id, "width", value)
            break
        }
        case "wdec10": {
            const value = rangeValue(csetts.width, -10, 1, setts.gridX, csetts.posX)
            setControlSetts(ctx, id, "width", value)
            break
        }
        case "winc": {
            const value = rangeValue(csetts.width, +1, 1, setts.gridX, csetts.posX)
            setControlSetts(ctx, id, "width", value)
            break
        }
        case "winc10": {
            const value = rangeValue(csetts.width, +10, 1, setts.gridX, csetts.posX)
            setControlSetts(ctx, id, "width", value)
            break
        }
        case "hdec": {
            const value = rangeValue(csetts.height, -1, 1, setts.gridY, csetts.posY)
            setControlSetts(ctx, id, "height", value)
            break
        }
        case "hdec10": {
            const value = rangeValue(csetts.height, -10, 1, setts.gridY, csetts.posY)
            setControlSetts(ctx, id, "height", value)
            break
        }
        case "hinc": {
            const value = rangeValue(csetts.height, +1, 1, setts.gridY, csetts.posY)
            setControlSetts(ctx, id, "height", value)
            break
        }
        case "hinc10": {
            const value = rangeValue(csetts.height, +10, 1, setts.gridY, csetts.posY)
            setControlSetts(ctx, id, "height", value)
            break
        }
    }
}

const exports = {
    initial,
    reducer,
    init,
    setMulti,
    setSelected,
    setSetts,
    setControlSetts,
    setControlData,
    addControl,
    actionControl,
}

export default exports
