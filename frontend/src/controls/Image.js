import Check from '../common/Check'
import Merge from "../tools/Merge"

function merge(target) {
    const _initial = data()
    Merge(_initial, target, (name, value) => dchecks[name](value))
    return target
}

const scales = ["Fit", "Stretch"]
const aligns = ["Center", "Start", "End"]

function data() {
    return {
        viewBox: "",
        content: "",
        filename: "",
        scale: scales[0],
        align: aligns[0],
    }
}

const dlabels = {
    viewBox: "viewBox",
    content: "Content",
    filename: "Filename",
    scale: "Scale",
    align: "Align",
}

const dhints = {
    viewBox: "viewBox",
    content: "Content",
    filename: "Filename",
    scale: "Select scale from list",
    align: "Select alignment from lis",
}

const dchecks = {
    viewBox: function (value) {
        Check.isString(value, dlabels.viewBox)
    },
    content: function (value) {
        Check.isString(value, dlabels.content)
    },
    filename: function (value) {
        Check.isString(value, dlabels.filename)
    },
    scale: function (value) {
        Check.isString(value, dlabels.scale)
        Check.notEmpty(value, dlabels.scale)
        Check.inList(value, dlabels.scale, scales)
    },
    align: function (value) {
        Check.isString(value, dlabels.align)
        Check.notEmpty(value, dlabels.align)
        Check.inList(value, dlabels.align, aligns)
    },
}

const type = "Image"

export default {
    type,
    merge,
    data,
    dlabels,
    dchecks,
    dhints,
    aligns,
    scales,
}
