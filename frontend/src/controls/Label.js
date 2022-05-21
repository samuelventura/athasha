import Check from '../editors/Check'

function cond() {
    return {
        type: "Disabled",
        param: "0",
        txType: "Disabled",
        txText: "",
        bgEnabled: false,
        bgColor: "#ffffff",
        fgEnabled: false,
        fgColor: "#ffffff",
        brEnabled: false,
        brColor: "#ffffff",
    }
}

function data() {
    return {
        input: "",
        text: "Label",
        align: "Center",
        fgColor: "#000000",
        ftSize: "10",
        ftFamily: "RobotoThin",
        bgEnabled: false,
        bgColor: "#ffffff",
        brWidth: "0",
        brColor: "#000000",
        brRadius: "0",
        cond1: cond(),
        cond2: cond(),
        cond3: cond(),
    }
}

const dlabels = {
    input: "Input",
    text: "Text",
    align: "Align",
    fgColor: "Text Color",
    ftSize: "Font Size",
    ftFamily: "Font Family",
    bgEnabled: "Background Enabled",
    bgColor: "Background",
    brWidth: "Border Width",
    brColor: "Border Color",
    brRadius: "Border Radius",
}

const dhints = {
    input: "Select optional data input from list",
    text: "Default text to show on label",
    align: "Label text alignment",
    fgColor: "Non empty text color #RRGGBB",
    ftSize: "Non empty integer > 0",
    ftFamily: "Select family from list",
    bgEnabled: "Uncheck for transparent background",
    bgColor: "Non empty background color #RRGGBB",
    brWidth: "Non empty integer >= 0",
    brColor: "Non empty border color #RRGGBB",
    brRadius: "Non empty number [0,1]",
}

const dchecks = {
    input: function (value) {
        Check.isString(value, dlabels.input)
    },
    text: function (value) {
        Check.isString(value, dlabels.text)
    },
    align: function (value) {
        Check.isString(value, dlabels.align)
        Check.notEmpty(value, dlabels.align)
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
    },
    bgEnabled: function (value) {
        Check.isBoolean(value, dlabels.bgEnabled)
    },
    bgColor: function (value) {
        Check.isString(value, dlabels.bgColor)
        Check.notEmpty(value, dlabels.bgColor)
        Check.isColor(value, dlabels.bgColor)
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
    param: "Param",
    txType: "Text Action",
    txText: "Text Param",
    bgEnabled: "Background Enabled",
    bgColor: "Background",
    fgEnabled: "Text Color Enabled",
    fgColor: "Text Color",
    brEnabled: "Border Color Enabled",
    brColor: "Border Color",
}

const chints = {
    type: "Select the condition type from list",
    param: "Optional number",
    txType: "Select the text action from list",
    txText: "Optional text param",
    bgEnabled: "Uncheck to leave the default background",
    bgColor: "Non empty column color #RRGGBB",
    fgEnabled: "Uncheck to leave the default text color",
    fgColor: "Non empty column color #RRGGBB",
    brEnabled: "Uncheck to leave the default border color",
    brColor: "Non empty column color #RRGGBB",
}

const cchecks = {
    type: function (value) {
        Check.isString(value, clabels.type)
        Check.notEmpty(value, clabels.type)
    },
    param: function (value) {
        Check.isString(value, clabels.param)
    },
    txType: function (value) {
        Check.isString(value, clabels.txType)
        Check.notEmpty(value, clabels.txType)
    },
    txText: function (value) {
        Check.isString(value, clabels.txText)
    },
    bgEnabled: function (value) {
        Check.isBoolean(value, clabels.bgEnabled)
    },
    bgColor: function (value) {
        Check.isString(value, clabels.bgColor)
        Check.notEmpty(value, clabels.bgColor)
        Check.isColor(value, clabels.bgColor)
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

function validate(control) {
    Check.validate(control.data, data(), dchecks, "data")
}

export default {
    validate,
    data,
    cond,
    dlabels,
    clabels,
    dchecks,
    cchecks,
    dhints,
    chints,
}
