import Datalog from '../editors/Datalog.js'
import Datalink from '../editors/Datalink.js'
import Datafetch from '../editors/Datafetch.js'
import Modbus from '../editors/Modbus.js'
import Screen from '../editors/Screen.js'
import Dataplot from '../editors/Dataplot.js'
import Laurel from '../editors/Laurel.js'
import Opto22 from '../editors/Opto22.js'

const initials = {
    Datalog,
    Datafetch,
    Datalink,
    Modbus,
    Screen,
    Dataplot,
    Laurel,
    Opto22,
}

export default function (type) {
    return initials[type]
}
