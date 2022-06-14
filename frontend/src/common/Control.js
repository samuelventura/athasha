import Label from '../schemas/Label.js'
import Analog from '../schemas/Analog.js'
import Image from '../schemas/Image.js'
import Trend from '../schemas/Trend.js'
import Schema from '../common/Schema.js'

const controls = {
    Label,
    Analog,
    Image,
    Trend,
}

const get = (type) => {
    const $control = controls[type]
    return {
        data: () => Schema.value($control.schema()),
        ...$control,
    }
}

const getters = Object.keys(controls).reduce((m, t) => { m[t] = get(t); return m }, {})

const exports = {
    get,
    ...getters,
}

export default exports
