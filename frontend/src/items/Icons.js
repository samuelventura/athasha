import Modbus from '../editors/Modbus.svg'
import Database from '../editors/Database.svg'
import Screen from '../editors/Screen.svg'
import Dataplot from '../editors/Dataplot.svg'
import Laurel from '../editors/Laurel.svg'
import Opto22 from '../editors/Opto22.svg'

const icons = {
    Database,
    Modbus,
    Screen,
    Dataplot,
    Laurel,
    Opto22,
}

export default function(type) {
    return icons[type]
}
