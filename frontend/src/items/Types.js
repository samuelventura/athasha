import Editors from './Editors'
import Initials from './Initials'
import Icons from './Icons'

const names = ["Datalog", "Dataplot", "Laurel", "Modbus", "Opto22", "Screen"]
const withView = ["Screen", "Dataplot", "Modbus", "Opto22", "Laurel"]

export default {
    names,
    withView,
    editor: (type) => Editors(type),
    initial: (type) => Initials(type),
    icon: (type) => Icons(type),
}
