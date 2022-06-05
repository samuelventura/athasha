import Check from '../common/Check'
import Merge from "../tools/Merge"

function merge(target) {
    const _initial = data()
    Merge(_initial, target, (name, value) => dchecks[name](value))
    return target
}

function data() {
    return {
    }
}

const dlabels = {
}

const dhints = {
}

const dchecks = {
}

const type = "New"

export default {
    type,
    merge,
    data,
    dlabels,
    dchecks,
    dhints,
}
