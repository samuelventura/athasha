import Modbus from '../editors/Modbus.jsx'
import Datalog from '../editors/Datalog.jsx'
import Datalink from '../editors/Datalink.jsx'
import Datafetch from '../editors/Datafetch.jsx'
import Screen from '../editors/Screen.jsx'
import Dataplot from '../editors/Dataplot.jsx'
import Laurel from '../editors/Laurel.jsx'
import Opto22 from '../editors/Opto22.jsx'
import Preset from '../editors/Preset.jsx'
//import Script from '../editors/Script.jsx'

const editors = {
    Datafetch,
    Datalink,
    Datalog,
    Modbus,
    Screen,
    Dataplot,
    Laurel,
    Opto22,
    Preset,
    // Script,
}

export default {
    get: (type) => editors[type],
}
