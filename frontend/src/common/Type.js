import Datalog from '../schemas/Datalog.js'
import Datalink from '../schemas/Datalink.js'
import Datafetch from '../schemas/Datafetch.js'
import Screen from '../schemas/Screen.js'
import Modbus from '../schemas/Modbus.js'
import Dataplot from '../schemas/Dataplot.js'
import Laurel from '../schemas/Laurel.js'
import Opto22 from '../schemas/Opto22.js'
import Script from '../schemas/Script.js'
import Preset from '../schemas/Preset.js'
import Schema from '../common/Schema.js'
import UUID from '../tools/UUID.js'

const types = {
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

const names = ["Datafetch", "Datalink", "Datalog", "Dataplot", "Laurel", "Modbus", "Opto22", "Preset", "Screen"]
const views = ["Screen", "Datafetch", "Dataplot", "Modbus", "Opto22", "Laurel"]

if (import.meta.env.DEV) names.push("Script")

const get = (type) => {
    const $type = types[type]
    return {
        item: (name) => item(type, name),
        config: () => Schema.value($type.schema()),
        merge: (config) => Schema.merge($type.schema(), config),
        ...$type,
    }
}

const item = (type, name) => {
    const id = UUID.v4()
    const config = Schema.value(types[type].schema())
    const enabled = false
    return { id, name, type, config, enabled }
}

const getters = names.reduce((m, n) => { m[n] = get(n); return m }, {})

const exports = {
    names,
    views,
    get,
    ...getters,
}

export default exports
