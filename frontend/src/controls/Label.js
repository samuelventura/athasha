import Check from '../common/Check'
import Merge from "../tools/Merge"

function merge(target) {
    const checks = { ...dchecks }
    checks.cond1 = () => { }
    checks.cond2 = () => { }
    checks.cond3 = () => { }
    const _initial = data()
    Merge(_initial, target, (name, value) => checks[name](value))
    Merge(_initial.cond1, target.cond1, (name, value) => cchecks[name](value))
    Merge(_initial.cond2, target.cond2, (name, value) => cchecks[name](value))
    Merge(_initial.cond3, target.cond3, (name, value) => cchecks[name](value))
    return target
}

const condTypes = [
    "Disabled",
    "Enabled",
    "Input > Param1",
    "Input >= Param1",
    "Param1 <= Input <= Param2",
    "Param1 <= Input < Param2",
    "Param1 < Input <= Param2",
    "Param1 < Input < Param2",
]
const txTypes = ["Disabled", "Fixed Text", "Format Text"]
const aligns = ["Center", "Left", "Right"]
const ftFamilies = [
    "Roboto Thin",
    "Roboto Light",
    "Roboto Regular",
    "Roboto Medium",
    "Roboto Bold",
    "Roboto Black",
    "Barcode39 Regular",
    "Barcode39 Text",
    "Barcode128 Regular",
    "Barcode128 Text",
    "Oxanium Extra Light",
    "Oxanium Light",
    "Oxanium Regular",
    "Oxanium Medium",
    "Oxanium Semi Bold",
    "Oxanium Bold",
    "Oxanium Extra Bold",
    "Orbitron Regular",
    "Orbitron Medium",
    "Orbitron Semi Bold",
    "Orbitron Bold",
    "Orbitron Extra Bold",
    "Orbitron Black",
]

function cond() {
    return {
        type: condTypes[0],
        param1: "0",
        param2: "0",
        negate: false,
        txType: txTypes[0],
        txText: "",
        backColored: false,
        backColor: "#ffffff",
        fgEnabled: false,
        fgColor: "#ffffff",
        brEnabled: false,
        brColor: "#ffffff",
    }
}

function data() {
    return {
        text: "Label",
        align: aligns[0],
        fgColor: "#000000",
        ftSize: "10",
        ftFamily: ftFamilies[0],
        backColored: false,
        backColor: "#ffffff",
        brWidth: "0",
        brColor: "#000000",
        brRadius: "0",
        cond1: cond(),
        cond2: cond(),
        cond3: cond(),
    }
}

const dlabels = {
    text: "Text",
    align: "Align",
    fgColor: "Text Color",
    ftSize: "Font Size",
    ftFamily: "Font Family",
    backColored: "Back Color Enabled",
    backColor: "Back Color",
    brWidth: "Border Width",
    brColor: "Border Color",
    brRadius: "Border Radius",
}

const dhints = {
    text: "Default text to show on label",
    align: "Label text alignment",
    fgColor: "Non empty text color #RRGGBB",
    ftSize: "Non empty integer > 0",
    ftFamily: "Select family from list",
    backColored: "Uncheck for transparent background",
    backColor: "Non empty background color #RRGGBB",
    brWidth: "Non empty integer >= 0",
    brColor: "Non empty border color #RRGGBB",
    brRadius: "Non empty number [0,1]",
}

const dchecks = {
    text: function (value) {
        Check.isString(value, dlabels.text)
    },
    align: function (value) {
        Check.isString(value, dlabels.align)
        Check.notEmpty(value, dlabels.align)
        Check.inList(value, dlabels.align, aligns)
    },
    fgColor: function (value) {
        Check.isString(value, dlabels.fgColor)
        Check.notEmpty(value, dlabels.fgColor)
        Check.isColor(value, dlabels.fgColor)
    },
    ftSize: function (value) {
        Check.isString(value, dlabels.ftSize)
        Check.notEmpty(value, dlabels.ftSize)
        Check.isInteger(value, dlabels.ftSize)
        Check.isGE(value, dlabels.ftSize, 1)
    },
    ftFamily: function (value) {
        Check.isString(value, dlabels.ftFamily)
        Check.notEmpty(value, dlabels.ftFamily)
        Check.inList(value, dlabels.ftFamily, ftFamilies)
    },
    backColored: function (value) {
        Check.isBoolean(value, dlabels.backColored)
    },
    backColor: function (value) {
        Check.isString(value, dlabels.backColor)
        Check.notEmpty(value, dlabels.backColor)
        Check.isColor(value, dlabels.backColor)
    },
    brWidth: function (value) {
        Check.isString(value, dlabels.brWidth)
        Check.notEmpty(value, dlabels.brWidth)
        Check.isInteger(value, dlabels.brWidth)
        Check.isGE(value, dlabels.brWidth, 0)
    },
    brColor: function (value) {
        Check.isString(value, dlabels.brColor)
        Check.notEmpty(value, dlabels.brColor)
        Check.isColor(value, dlabels.brColor)
    },
    brRadius: function (value) {
        Check.isString(value, dlabels.brRadius)
        Check.notEmpty(value, dlabels.brRadius)
        Check.isNumber(value, dlabels.brRadius)
        Check.isGE(value, dlabels.brRadius, 0)
        Check.isLE(value, dlabels.brRadius, 1)
    },
    cond1: function (value) {
        Check.validate(value, cond(), cchecks, "cond1")
    },
    cond2: function (value) {
        Check.validate(value, cond(), cchecks, "cond2")
    },
    cond3: function (value) {
        Check.validate(value, cond(), cchecks, "cond3")
    },
}

const clabels = {
    type: "Condition",
    param: "Params",
    param1: "Param 1",
    param2: "Param 2",
    negate: "Negate",
    txType: "Text Action",
    txText: "Text Param",
    backColored: "Back Color Enabled",
    backColor: "Back Color",
    fgEnabled: "Text Color Enabled",
    fgColor: "Text Color",
    brEnabled: "Border Color Enabled",
    brColor: "Border Color",
}

const chints = {
    type: "Select the condition type from list",
    param1: "Optional number",
    param2: "Optional number",
    negate: "Reverse the comparison codition",
    txType: "Select the text action from list",
    txText: "Optional text param",
    backColored: "Uncheck for transparent back color",
    backColor: "Non empty column color #RRGGBB",
    fgEnabled: "Uncheck to leave the default text color",
    fgColor: "Non empty column color #RRGGBB",
    brEnabled: "Uncheck to leave the default border color",
    brColor: "Non empty column color #RRGGBB",
}

const cchecks = {
    type: function (value) {
        Check.isString(value, clabels.type)
        Check.notEmpty(value, clabels.type)
        Check.inList(value, clabels.type, condTypes)
    },
    param1: function (value) {
        Check.isString(value, clabels.param1)
    },
    param2: function (value) {
        Check.isString(value, clabels.param2)
    },
    negate: function (value) {
        Check.isBoolean(value, clabels.negate)
    },
    txType: function (value) {
        Check.isString(value, clabels.txType)
        Check.notEmpty(value, clabels.txType)
        Check.inList(value, clabels.txType, txTypes)
    },
    txText: function (value) {
        Check.isString(value, clabels.txText)
    },
    backColored: function (value) {
        Check.isBoolean(value, clabels.backColored)
    },
    backColor: function (value) {
        Check.isString(value, clabels.backColor)
        Check.notEmpty(value, clabels.backColor)
        Check.isColor(value, clabels.backColor)
    },
    fgEnabled: function (value) {
        Check.isBoolean(value, clabels.fgEnabled)
    },
    fgColor: function (value) {
        Check.isString(value, clabels.fgColor)
        Check.notEmpty(value, clabels.fgColor)
        Check.isColor(value, clabels.fgColor)
    },
    brEnabled: function (value) {
        Check.isBoolean(value, clabels.brEnabled)
    },
    brColor: function (value) {
        Check.isString(value, clabels.brColor)
        Check.notEmpty(value, clabels.brColor)
        Check.isColor(value, clabels.brColor)
    },
}

const type = "Label"

export default {
    type,
    merge,
    data,
    cond,
    dlabels,
    clabels,
    dchecks,
    cchecks,
    dhints,
    chints,
    condTypes,
    txTypes,
    aligns,
    ftFamilies,
}
