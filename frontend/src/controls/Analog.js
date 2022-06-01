import Check from '../editors/Check'
import Merge from "../tools/Merge"

function merge(target) {
    const _initial = data()
    Merge(_initial, target, (name, value) => dchecks[name](value))
    return target
}

function data() {
    return {
        text: "Label",
    }
}

const dlabels = {
    text: "Text",
}

const dhints = {
    text: "Default text to show on label",
}

const dchecks = {
    text: function (value) {
        Check.isString(value, dlabels.text)
    },
}

function validate(control) {
    Check.validate(control.data, data(), dchecks, "data")
}

const type = "Analog"

export default {
    type,
    merge,
    validate,
    data,
    dlabels,
    dchecks,
    dhints,
}
