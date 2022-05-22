import Modbus from '../editors/Modbus.jsx'
import Datalog from '../editors/Datalog.jsx'
import Datafetch from '../editors/Datafetch.jsx'
import Screen from '../editors/Screen.jsx'
import Dataplot from '../editors/Dataplot.jsx'
import Laurel from '../editors/Laurel.jsx'
import Opto22 from '../editors/Opto22.jsx'

const editors = {
    Datalog,
    Datafetch,
    Modbus,
    Screen,
    Dataplot,
    Laurel,
    Opto22,
}

export default function (type) {
    return editors[type]
}
