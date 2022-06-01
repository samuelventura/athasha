import Check from '../editors/Check'
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

function validate(control) {
    Check.validate(control.data, data(), dchecks, "data")
}

const type = "Image"

export default {
    type,
    merge,
    validate,
    data,
    dlabels,
    dchecks,
    dhints,
}
