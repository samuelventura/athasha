import Datalog from '../schemas/Datalog.js'
import Datalink from '../schemas/Datalink.js'
import Datafetch from '../schemas/Datafetch.js'
import Screen from '../schemas/Screen.js'
import Modbus from '../schemas/Modbus.js'
import Dataplot from '../schemas/Dataplot.js'
import Laurel from '../schemas/Laurel.js'
import Opto22 from '../schemas/Opto22.js'
import Schema from '../common/Schema.js'
import { v4 as uuidv4 } from 'uuid'

const types = {
    Datalog,
    Datafetch,
    Datalink,
    Modbus,
    Screen,
    Dataplot,
    Laurel,
    Opto22,
}

const names = ["Datafetch", "Datalink", "Datalog", "Dataplot", "Laurel", "Modbus", "Opto22", "Screen"]
const views = ["Screen", "Datafetch", "Dataplot", "Modbus", "Opto22", "Laurel"]

const get = (type) => {
    const $type = types[type]
    return {
        config: () => Schema.value($type.schema()),
        merge: (config) => Schema.merge($type.schema(), config),
        ...$type,
    }
}

const item = (type) => {
    return {
        id: uuidv4(),
        type: type,
        config: Schema.value(types[type].schema()),
        enabled: false,
    }
}

const getters = names.map(n => get(n))

const exports = {
    names,
    views,
    get,
    item,
    ...getters,
}

export default exports
