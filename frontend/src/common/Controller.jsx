import Label from '../controls/Label.jsx'
import Analog from '../controls/Analog.jsx'
import Image from '../controls/Image.jsx'
import Trend from '../controls/Trend.jsx'
import Frame from '../controls/Frame.jsx'

const controls = {
    Label,
    Analog,
    Image,
    Trend,
}

const exports = {
    get: (type) => controls[type] || Frame,
    list: () => Object.values(controls),
}

export default exports
