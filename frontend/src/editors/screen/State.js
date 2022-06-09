import Log from "../../tools/Log"
import Clone from "../../tools/Clone"
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

function updateIndexes(state) {
    state.controls.forEach((control, index) => {
        const id = control.id
        state.indexes[id] = index
    })
}

//although version is being used as useEffect 
//changing flag version_check must run on every 
//mutation to ensure checks are always run
function versionCheck(state, mut) {
    const clen = state.controls.length
    const ilen = Object.keys(state.indexes).length
    if (clen !== ilen) throw `Length mismatch ${clen} ${ilen} after ${mut}`
    const selected = state.selected
    if (selected && !(selected in state.indexes)) {
        throw `Missing selected id ${selected} after ${mut}`
    }
    state.multi.forEach(id => {
        if (!(id in state.indexes)) {
            throw `Missing index for multi id ${id} after ${mut}`
        }
    })
    state.version++
}

function moduleIndex(state, index) {
    const total = state.controls.length
    return (index + total) % total
}

function reducer(state, { name, args }) {
    args = Clone.deep(args)
    state = Clone.deep(state)
    return mutate(state, { name, args })
}

function mutate(state, { name, args }) {
    const version = state.version
    const mut = { version, name, args }
    // Log.log("mutate", version, name, args)
    switch (name) {
        case "set": {
            state = args.state
            //version preservation is critical to
            //correctly handle initial transients
            state.version = version
            updateIndexes(state)
            versionCheck(state, mut)
            return state
        }
        case "init": {
            state = initial()
            //version preservation is critical to
            //correctly handle initial transients
            state.version = version
            state.controls = args.controls
            state.setts = args.setts
            updateIndexes(state)
            versionCheck(state, mut)
            return state
        }
        case "select": {
            state.selected = args.id
            versionCheck(state, mut)
            return state
        }
        case "multi": {
            state.multi = args.ids || []
            versionCheck(state, mut)
            return state
        }
        case "setts": {
            state.setts[args.name] = args.value
            versionCheck(state, mut)
            return state
        }
        case "control-setts": {
            const index = state.indexes[args.id]
            const control = state.controls[index]
            control.setts[args.name] = args.value
            versionCheck(state, mut)
            return state
        }
        case "control-data": {
            const index = state.indexes[args.id]
            const control = state.controls[index]
            control.data[args.name] = args.value
            versionCheck(state, mut)
            return state
        }
        case "control-add": {
            const control = args.control
            const index = state.controls.length
            state.controls.push(control)
            state.indexes[control.id] = index
            state.selected = control.id
            versionCheck(state, mut)
            return state
        }
        case "control-del": {
            const index = state.indexes[args.id]
            delete state.indexes[args.id]
            state.controls.splice(index, 1)
            if (state.selected === args.id) {
                state.selected = null
            }
            state.multi = state.multi.filter(id => id !== args.id)
            updateIndexes(state)
            versionCheck(state, mut)
            return state
        }
        case "control-up": {
            const index = state.indexes[args.id]
            const control = state.controls[index]
            const module = moduleIndex(state, index + 1)
            state.controls.splice(index, 1)
            state.controls.splice(module, 0, control)
            updateIndexes(state)
            versionCheck(state, mut)
            return state
        }
        case "control-down": {
            const index = state.indexes[args.id]
            const control = state.controls[index]
            const module = moduleIndex(state, index - 1)
            state.controls.splice(index, 1)
            state.controls.splice(module, 0, control)
            updateIndexes(state)
            versionCheck(state, mut)
            return state
        }
        case "control-top": {
            const index = state.indexes[args.id]
            const control = state.controls[index]
            const length = state.controls.length
            state.controls.splice(index, 1)
            state.controls.splice(length, 0, control)
            updateIndexes(state)
            versionCheck(state, mut)
            return state
        }
        case "control-bottom": {
            const index = state.indexes[args.id]
            const control = state.controls[index]
            state.controls.splice(index, 1)
            state.controls.splice(0, 0, control)
            updateIndexes(state)
            versionCheck(state, mut)
            return state
        }
        default:
            Log.log("Unknown mutation", name, args)
            return state
    }
}

function ensureRange(curr, inc, min, max, size) {
    const upper = Number(max) - Number(size)
    const value = Number(curr) + inc
    const trimmed = Math.max(min, Math.min(upper, value))
    return trimmed.toString()
}

//minimize mutations in prep
//for undo and group actions
//won't works if commands depend on
//the state mutated by previous command
const multiMutation = (ctx, list) => {
    if (list.length === 0) return
    const state = list.reduce((state, mut) => {
        return mutate(state, mut)
    }, Clone.deep(ctx.state))
    ctx.dispatch({ name: "set", args: { state } })
}

const mutator = (ctx, buffered) => {
    const self = {}
    const buffer = []
    const getControl = (id) => {
        const state = ctx.state
        const index = state.indexes[id]
        return state.controls[index]
    }
    const getSetts = (id) => {
        const state = ctx.state
        const setts = state.setts
        const index = state.indexes[id]
        const control = state.controls[index]
        const csetts = control.setts
        return { setts, csetts }
    }
    const apply = (mut) => {
        if (buffered) {
            buffer.push(mut)
        } else {
            ctx.dispatch(mut)
        }
        return self
    }
    self.apply = () => {
        multiMutation(ctx, buffer)
        buffer.splice(0, buffer.length)
        return self
    }
    self.init = (setts, controls) => ctx.dispatch({ name: "init", args: { setts, controls } })
    self.setMulti = (ids) => apply({ name: "multi", args: { ids } })
    self.setSelected = (id) => apply({ name: "select", args: { id } })
    self.setSetts = (name, value) => apply({ name: "setts", args: { name, value } })
    self.setControlSetts = (id, name, value) => apply({ name: "control-setts", args: { id, name, value } })
    self.setControlData = (id, name, value) => apply({ name: "control-data", args: { id, name, value } })
    self.addControl = (control) => apply({ name: "control-add", args: { control } })
    self.actionControl = (id, action) => {
        switch (action) {
            case "clone": {
                const control = getControl(id)
                const clone = Clone.deep(control)
                clone.id = uuidv4()
                return apply({ name: "control-add", args: { control: clone } })
            }
            case "del": {
                return apply({ name: "control-del", args: { id } })
            }
            case "up": {
                return apply({ name: "control-up", args: { id } })
            }
            case "down": {
                return apply({ name: "control-down", args: { id } })
            }
            case "top": {
                return apply({ name: "control-top", args: { id } })
            }
            case "bottom": {
                return apply({ name: "control-bottom", args: { id } })
            }
            case "xdec": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.posX, -1, 0, setts.gridX, csetts.width)
                return self.setControlSetts(id, "posX", value)
            }
            case "xdec10": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.posX, -10, 0, setts.gridX, csetts.width)
                return self.setControlSetts(id, "posX", value)
            }
            case "xinc": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.posX, +1, 0, setts.gridX, csetts.width)
                return self.setControlSetts(id, "posX", value)
            }
            case "xinc10": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.posX, +10, 0, setts.gridX, csetts.width)
                return self.setControlSetts(id, "posX", value)
            }
            case "ydec": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.posY, -1, 0, setts.gridY, csetts.height)
                return self.setControlSetts(id, "posY", value)
            }
            case "ydec10": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.posY, -10, 0, setts.gridY, csetts.height)
                return self.setControlSetts(id, "posY", value)
            }
            case "yinc": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.posY, +1, 0, setts.gridY, csetts.height)
                return self.setControlSetts(id, "posY", value)
            }
            case "yinc10": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.posY, +10, 0, setts.gridY, csetts.height)
                return self.setControlSetts(id, "posY", value)
            }
            case "wdec": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.width, -1, 1, setts.gridX, csetts.posX)
                return self.setControlSetts(id, "width", value)
            }
            case "wdec10": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.width, -10, 1, setts.gridX, csetts.posX)
                return self.setControlSetts(id, "width", value)
            }
            case "winc": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.width, +1, 1, setts.gridX, csetts.posX)
                return self.setControlSetts(id, "width", value)
            }
            case "winc10": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.width, +10, 1, setts.gridX, csetts.posX)
                return self.setControlSetts(id, "width", value)
            }
            case "hdec": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.height, -1, 1, setts.gridY, csetts.posY)
                return self.setControlSetts(id, "height", value)
            }
            case "hdec10": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.height, -10, 1, setts.gridY, csetts.posY)
                return self.setControlSetts(id, "height", value)
            }
            case "hinc": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.height, +1, 1, setts.gridY, csetts.posY)
                return self.setControlSetts(id, "height", value)
            }
            case "hinc10": {
                const { csetts, setts } = getSetts(id)
                const value = ensureRange(csetts.height, +10, 1, setts.gridY, csetts.posY)
                return self.setControlSetts(id, "height", value)
            }
        }
    }
    return self
}

const exports = {
    initial,
    reducer,
    mutator,
}

export default exports
