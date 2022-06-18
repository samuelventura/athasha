import Modbus from '../icons/Modbus.svg'
import Datalog from '../icons/Datalog.svg'
import Datalink from '../icons/Datalink.svg'
import Datafetch from '../icons/Datafetch.svg'
import Screen from '../icons/Screen.svg'
import Dataplot from '../icons/Dataplot.svg'
import Laurel from '../icons/Laurel.svg'
import Opto22 from '../icons/Opto22.svg'
import Script from '../icons/Script.svg'
import Preset from '../icons/Preset.svg'

const icons = {
    Datalog,
    Datafetch,
    Datalink,
    Modbus,
    Screen,
    Dataplot,
    Laurel,
    Opto22,
    Script,
    Preset,
}

export default {
    get: (type) => icons[type]
}
