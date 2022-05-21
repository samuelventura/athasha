import Datalog from '../editors/Datalog.js'
import Modbus from '../editors/Modbus.js'
import Screen from '../editors/Screen.js'
import Dataplot from '../editors/Dataplot.js'
import Laurel from '../editors/Laurel.js'
import Opto22 from '../editors/Opto22.js'

const initials = {
    Datalog,
    Modbus,
    Screen,
    Dataplot,
    Laurel,
    Opto22,
}

export default function (type) {
    return initials[type]
}
