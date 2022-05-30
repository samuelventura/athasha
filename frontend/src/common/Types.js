import Initials from './Initials'
import Icons from './Icons'

const names = ["Datafetch", "Datalog", "Datalink", "Dataplot", "Laurel", "Modbus", "Opto22", "Screen"]
const withView = ["Screen", "Datafetch", "Dataplot", "Modbus", "Opto22", "Laurel"]

export default {
    names,
    withView,
    initial: (type) => Initials(type),
    icon: (type) => Icons(type),
}
