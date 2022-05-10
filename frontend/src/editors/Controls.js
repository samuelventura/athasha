import ControlFrame from '../controls/Frame.jsx'
import ControlLabel from '../controls/Label.jsx'

const registeredMap = {}
const registeredList = []

function register(control, hide) {
    if (!hide) {
        registeredList.push(control)
    }
    registeredMap[control.Type] = control
}

//https://vitejs.dev/guide/env-and-mode.html
register(ControlFrame, import.meta.env.PROD)
register(ControlLabel)

function getController(type) {
    return registeredMap[type] || ControlFrame
}

function registeredMapper(mapper) {
    return registeredList.map(mapper)
}

export default {
    getController,
    registeredMapper,
}
