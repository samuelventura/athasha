import Check from '../common/Check'
import Merge from "../common/Merge"

function merge(target) {
    const checks = { ...dchecks }
    checks.cond1 = () => { }
    checks.cond2 = () => { }
    checks.cond3 = () => { }
    const _initial = data()
    Merge.apply(_initial, target, (name, value) => checks[name](value))
    Merge.apply(_initial.cond1, target.cond1, (name, value) => cchecks[name](value))
    Merge.apply(_initial.cond2, target.cond2, (name, value) => cchecks[name](value))
    Merge.apply(_initial.cond3, target.cond3, (name, value) => cchecks[name](value))
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
const textActions = ["Disabled", "Fixed Text", "Format Text"]
const aligns = ["Center", "Left", "Right"]
const fontFamilies = [
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
        textAction: textActions[0],
        textParam: "",
        backColored: false,
        backColor: "#ffffff",
        textColored: false,
        textColor: "#ffffff",
        borderColored: false,
        borderColor: "#ffffff",
    }
}

function data() {
    return {
        text: "Label",
        align: aligns[0],
        textColor: "#000000",
        fontSize: "10",
        fontFamily: fontFamilies[0],
        backColored: false,
        backColor: "#ffffff",
        borderWidth: "0",
        borderColor: "#000000",
        borderRadius: "0",
        cond1: cond(),
        cond2: cond(),
        cond3: cond(),
    }
}

const dlabels = {
    text: "Text",
    align: "Align",
    textColor: "Text Color",
    fontSize: "Font Size",
    fontFamily: "Font Family",
    backColored: "Back Color Enabled",
    backColor: "Back Color",
    borderWidth: "Border Width",
    borderColor: "Border Color",
    borderRadius: "Border Radius",
}

const dhints = {
    text: "Default text to show on label",
    align: "Label text alignment",
    textColor: "Non empty text color #RRGGBB",
    fontSize: "Non empty integer > 0",
    fontFamily: "Select family from list",
    backColored: "Uncheck for transparent back color",
    backColor: "Non empty back color #RRGGBB",
    borderWidth: "Non empty integer >= 0",
    borderColor: "Non empty border color #RRGGBB",
    borderRadius: "Non empty number [0,1]",
}

function validate(values, inits, checks, label) {
    Object.keys(inits).forEach((prop) => {
        Check.hasProp(values, label, prop)
        checks[prop](values[prop])
    })
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
    textColor: function (value) {
        Check.isString(value, dlabels.textColor)
        Check.notEmpty(value, dlabels.textColor)
        Check.isColor(value, dlabels.textColor)
    },
    fontSize: function (value) {
        Check.isString(value, dlabels.fontSize)
        Check.notEmpty(value, dlabels.fontSize)
        Check.isInteger(value, dlabels.fontSize)
        Check.isGE(value, dlabels.fontSize, 1)
    },
    fontFamily: function (value) {
        Check.isString(value, dlabels.fontFamily)
        Check.notEmpty(value, dlabels.fontFamily)
        Check.inList(value, dlabels.fontFamily, fontFamilies)
    },
    backColored: function (value) {
        Check.isBoolean(value, dlabels.backColored)
    },
    backColor: function (value) {
        Check.isString(value, dlabels.backColor)
        Check.notEmpty(value, dlabels.backColor)
        Check.isColor(value, dlabels.backColor)
    },
    borderWidth: function (value) {
        Check.isString(value, dlabels.borderWidth)
        Check.notEmpty(value, dlabels.borderWidth)
        Check.isInteger(value, dlabels.borderWidth)
        Check.isGE(value, dlabels.borderWidth, 0)
    },
    borderColor: function (value) {
        Check.isString(value, dlabels.borderColor)
        Check.notEmpty(value, dlabels.borderColor)
        Check.isColor(value, dlabels.borderColor)
    },
    borderRadius: function (value) {
        Check.isString(value, dlabels.borderRadius)
        Check.notEmpty(value, dlabels.borderRadius)
        Check.isNumber(value, dlabels.borderRadius)
        Check.isGE(value, dlabels.borderRadius, 0)
        Check.isLE(value, dlabels.borderRadius, 1)
    },
    cond1: function (value) {
        validate(value, cond(), cchecks, "cond1")
    },
    cond2: function (value) {
        validate(value, cond(), cchecks, "cond2")
    },
    cond3: function (value) {
        validate(value, cond(), cchecks, "cond3")
    },
}

const clabels = {
    type: "Condition",
    param: "Params",
    param1: "Param 1",
    param2: "Param 2",
    negate: "Negate",
    textAction: "Text Action",
    textParam: "Text Param",
    backColored: "Back Color Enabled",
    backColor: "Back Color",
    textColored: "Text Color Enabled",
    textColor: "Text Color",
    borderColored: "Border Color Enabled",
    borderColor: "Border Color",
}

const chints = {
    type: "Select the condition type from list",
    param1: "Optional number",
    param2: "Optional number",
    negate: "Reverse the comparison codition",
    textAction: "Select the text action from list",
    textParam: "Optional text param",
    backColored: "Uncheck for transparent back color",
    backColor: "Non empty column color #RRGGBB",
    textColored: "Uncheck to leave the default text color",
    textColor: "Non empty column color #RRGGBB",
    borderColored: "Uncheck to leave the default border color",
    borderColor: "Non empty column color #RRGGBB",
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
    textAction: function (value) {
        Check.isString(value, clabels.textAction)
        Check.notEmpty(value, clabels.textAction)
        Check.inList(value, clabels.textAction, textActions)
    },
    textParam: function (value) {
        Check.isString(value, clabels.textParam)
    },
    backColored: function (value) {
        Check.isBoolean(value, clabels.backColored)
    },
    backColor: function (value) {
        Check.isString(value, clabels.backColor)
        Check.notEmpty(value, clabels.backColor)
        Check.isColor(value, clabels.backColor)
    },
    textColored: function (value) {
        Check.isBoolean(value, clabels.textColored)
    },
    textColor: function (value) {
        Check.isString(value, clabels.textColor)
        Check.notEmpty(value, clabels.textColor)
        Check.isColor(value, clabels.textColor)
    },
    borderColored: function (value) {
        Check.isBoolean(value, clabels.borderColored)
    },
    borderColor: function (value) {
        Check.isString(value, clabels.borderColor)
        Check.notEmpty(value, clabels.borderColor)
        Check.isColor(value, clabels.borderColor)
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
    textActions,
    aligns,
    fontFamilies,
}
