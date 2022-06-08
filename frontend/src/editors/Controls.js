import Frame from '../controls/Frame.jsx'
import Label from '../controls/Label.jsx'
import Analog from '../controls/Analog.jsx'
import Image from '../controls/Image.jsx'
import Trend from '../controls/Trend.jsx'

const registeredMap = {}
const registeredList = []

function register(control, hide) {
    if (!hide) {
        registeredList.push(control)
    }
    registeredMap[control.Type] = control
}

//https://vitejs.dev/guide/env-and-mode.html
register(Label)
register(Image)
register(Analog)
register(Trend)

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
