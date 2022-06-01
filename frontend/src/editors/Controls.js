import Frame from '../controls/Frame.jsx'
import Label from '../controls/Label.jsx'
import Analog from '../controls/Analog.jsx'
import Image from '../controls/Image.jsx'

const registeredMap = {}
const registeredList = []

function register(control, hide) {
    if (!hide) {
        registeredList.push(control)
    }
    registeredMap[control.Type] = control
}

//https://vitejs.dev/guide/env-and-mode.html
//register(ControlFrame, import.meta.env.PROD)
register(Label)
register(Image)
register(Analog)

function getController(type) {
    return registeredMap[type] || Frame
}

function registeredMapper(mapper) {
    return registeredList.map(mapper)
}

export default {
    getController,
    registeredMapper,
}
