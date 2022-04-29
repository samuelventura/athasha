import ControlLabel from '../controls/Label'
import ControlEmpty from '../controls/Empty'

const registeredMap = {}
const registeredList = []

function register(control, hide) {
    if (!hide) {
        registeredList.push(control)
    }
    registeredMap[control.Type] = control
}

//https://vitejs.dev/guide/env-and-mode.html
register(ControlEmpty, import.meta.env.PROD)
register(ControlLabel)

function getController(type) {
    return registeredMap[type] || ControlEmpty
}

function registeredMapper(mapper) {
    return registeredList.map(mapper)
}

export {
    getController,
    registeredMapper,
}
