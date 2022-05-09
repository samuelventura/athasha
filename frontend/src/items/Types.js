import Editors from './Editors'
import Pointers from './Pointers'
import Initials from './Initials'
import Icons from './Icons'

const names = ["Database", "Dataplot", "Laurel", "Modbus", "Opto22", "Screen"]

export default {
    names,
    editor: (type) => Editors(type),
    pointer: (type) => Pointers(type),
    initial: (type) => Initials(type),
    icon: (type) => Icons(type),
}
