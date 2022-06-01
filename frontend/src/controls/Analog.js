import Check from '../editors/Check'
import Merge from "../tools/Merge"

function merge(target) {
    const _initial = data()
    Merge(_initial, target, (name, value) => dchecks[name](value))
    return target
}

function data() {
    return {
        orientation: "Vertical", //Vertical|Horizontal|Circular
        style: "Standard", //Standard|Custom
        barZero: "0",
        barSpan: "100",
        barWidth: "10",
        inputMin: "0",
        inputMax: "10000",
        normalMin: "4000",
        normalMax: "6000",
        warningMin: "2000",
        warningMax: "8000",
        cursorColor: "#000000",
        normalColor: "#27ae60",
        warningColor: "#f1c40f",
        criticalColor: "#c0392b",
    }
}

const dlabels = {
    orientation: "Orientation",
    style: "Style",
    barRange: "Bar Config",
    barZero: "Bar Range Zero",
    barSpan: "Bar Range Span",
    barWidth: "Bar Range Width",
    inputRange: "Input Range",
    inputMin: "Input Range Minimum",
    inputMax: "Input Range Maximum",
    normalRange: "Normal Range",
    normalMin: "Normal Range Minimum",
    normalMax: "Normal Range Maximum",
    warningRange: "Warning Range",
    warningMin: "Warning Range Minimum",
    warningMax: "Warning Range Maximum",
    cursorColor: "Cursor Color",
    normalColor: "Normal Color",
    warningColor: "Warning Color",
    criticalColor: "Critical Color",
}

const dhints = {
    orientation: "Bar orientation",
    barZero: "Non empty number [-180, 180]",
    barSpan: "Non empty number (0, 360]",
    barWidth: "Non empty number > 0",
    inputMin: "Non empty number (same as critical)",
    inputMax: "Non empty number (same as critical)",
    normalMin: "Non empty number",
    normalMax: "Non empty number",
    warningMin: "Non empty number",
    warningMax: "Non empty number",
    cursorColor: "Non empty cursor color #RRGGBB",
    normalColor: "Non empty normal color #RRGGBB",
    warningColor: "Non empty warning color #RRGGBB",
    criticalColor: "Non empty critical color #RRGGBB",
}

const dchecks = {
    orientation: function (value) {
        Check.isString(value, dlabels.orientation)
        Check.notEmpty(value, dlabels.orientation)
    },
    style: function (value) {
        Check.isString(value, dlabels.style)
        Check.notEmpty(value, dlabels.style)
    },
    barZero: function (value) {
        Check.isString(value, dlabels.barZero)
        Check.notEmpty(value, dlabels.barZero)
        Check.isNumber(value, dlabels.barZero)
        Check.isGE(value, dlabels.barZero, -180)
        Check.isLE(value, dlabels.barZero, +180)
    },
    barSpan: function (value) {
        Check.isString(value, dlabels.barSpan)
        Check.notEmpty(value, dlabels.barSpan)
        Check.isNumber(value, dlabels.barSpan)
        Check.isGT(value, dlabels.barSpan, 0)
        Check.isLE(value, dlabels.barSpan, 360)
    },
    barWidth: function (value) {
        Check.isString(value, dlabels.barWidth)
        Check.notEmpty(value, dlabels.barWidth)
        Check.isNumber(value, dlabels.barWidth)
        Check.isGT(value, dlabels.barWidth, 0)
    },
    inputMin: function (value) {
        Check.isString(value, dlabels.inputMin)
        Check.notEmpty(value, dlabels.inputMin)
        Check.isNumber(value, dlabels.inputMin)
    },
    inputMax: function (value) {
        Check.isString(value, dlabels.inputMax)
        Check.notEmpty(value, dlabels.inputMax)
        Check.isNumber(value, dlabels.inputMax)
    },
    normalMin: function (value) {
        Check.isString(value, dlabels.normalMin)
        Check.notEmpty(value, dlabels.normalMin)
        Check.isNumber(value, dlabels.normalMin)
    },
    normalMax: function (value) {
        Check.isString(value, dlabels.normalMax)
        Check.notEmpty(value, dlabels.normalMax)
        Check.isNumber(value, dlabels.normalMax)
    },
    warningMin: function (value) {
        Check.isString(value, dlabels.warningMin)
        Check.notEmpty(value, dlabels.warningMin)
        Check.isNumber(value, dlabels.warningMin)
    },
    warningMax: function (value) {
        Check.isString(value, dlabels.warningMax)
        Check.notEmpty(value, dlabels.warningMax)
        Check.isNumber(value, dlabels.warningMax)
    },
    cursorColor: function (value) {
        Check.isString(value, dlabels.cursorColor)
        Check.notEmpty(value, dlabels.cursorColor)
        Check.isColor(value, dlabels.cursorColor)
    },
    normalColor: function (value) {
        Check.isString(value, dlabels.normalColor)
        Check.notEmpty(value, dlabels.normalColor)
        Check.isColor(value, dlabels.normalColor)
    },
    warningColor: function (value) {
        Check.isString(value, dlabels.warningColor)
        Check.notEmpty(value, dlabels.warningColor)
        Check.isColor(value, dlabels.warningColor)
    },
    criticalColor: function (value) {
        Check.isString(value, dlabels.criticalColor)
        Check.notEmpty(value, dlabels.criticalColor)
        Check.isColor(value, dlabels.criticalColor)
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
