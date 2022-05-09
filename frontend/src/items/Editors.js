import Modbus from '../editors/Modbus.jsx'
import Database from '../editors/Database.jsx'
import Screen from '../editors/Screen.jsx'
import Dataplot from '../editors/Dataplot.jsx'
import Laurel from '../editors/Laurel.jsx'
import Opto22 from '../editors/Opto22.jsx'

const editors = {
    Database,
    Modbus,
    Screen,
    Dataplot,
    Laurel,
    Opto22,
}

export default function(type) {
    return editors[type]
}
