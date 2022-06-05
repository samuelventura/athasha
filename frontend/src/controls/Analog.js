import Check from '../common/Check'
import Merge from "../tools/Merge"

function merge(target) {
    const _initial = data()
    Merge(_initial, target, (name, value) => dchecks[name](value))
    return target
}

const orientations = ["Circular", "Vertical", "Horizontal"]
const styles = ["Standard", "Custom"]

function data() {
    return {
        orientation: orientations[0],
        style: styles[0],
        barZero: "0",
        barSpan: "180",
        barWidth: "10",
        barRatio: "1",
        barOpacity: "0.1",
        barGrayscale: "0",
        bgEnabled: false,
        bgColor: "#f8f8f8",
        inputMin: "0",
        inputMax: "10000",
        normalMin: "4000",
        normalMax: "6000",
        warningMin: "2000",
        warningMax: "8000",
        normalColor: "#88B407",
        warningColor: "#FF9436",
        criticalColor: "#FC342A",
    }
}

const dlabels = {
    orientation: "Orientation",
    style: "Look & Feel",
    barConfig: "Bar Config",
    barZero: "Bar Zero",
    barSpan: "Bar Span",
    barWidth: "Bar Width",
    barParams: "Bar Params",
    barRatio: "Bar Ratio",
    barOpacity: "Bar Opacity",
    barGrayscale: "Bar Grayscale",
    bgEnabled: "Background Enabled",
    bgColor: "Background",
    inputRange: "Input Range",
    inputMin: "Input Range Minimum",
    inputMax: "Input Range Maximum",
    normalRange: "Normal Range",
    normalMin: "Normal Range Minimum",
    normalMax: "Normal Range Maximum",
    warningRange: "Warning Range",
    warningMin: "Warning Range Minimum",
    warningMax: "Warning Range Maximum",
    normalColor: "Normal Color",
    warningColor: "Warning Color",
    criticalColor: "Critical Color",
}

const dhints = {
    orientation: "Bar orientation",
    barZero: "Non empty number [-180, 180]",
    barSpan: "Non empty number (0, 360]",
    barWidth: "Non empty number > 0",
    barRatio: "Non empty number (0, 1]",
    barOpacity: "Non empty number (0, 1]",
    barGrayscale: "Non empty number [0, 1]",
    bgEnabled: "Uncheck for transparent background",
    bgColor: "Non empty background color #RRGGBB",
    inputMin: "Non empty number (same as critical)",
    inputMax: "Non empty number (same as critical)",
    normalMin: "Non empty number",
    normalMax: "Non empty number",
    warningMin: "Non empty number",
    warningMax: "Non empty number",
    normalColor: "Non empty normal color #RRGGBB",
    warningColor: "Non empty warning color #RRGGBB",
    criticalColor: "Non empty critical color #RRGGBB",
}

const dchecks = {
    orientation: function (value) {
        Check.isString(value, dlabels.orientation)
        Check.notEmpty(value, dlabels.orientation)
        Check.inList(value, dlabels.orientation, orientations)
    },
    style: function (value) {
        Check.isString(value, dlabels.style)
        Check.notEmpty(value, dlabels.style)
        Check.inList(value, dlabels.style, styles)
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
    barRatio: function (value) {
        Check.isString(value, dlabels.barRatio)
        Check.notEmpty(value, dlabels.barRatio)
        Check.isNumber(value, dlabels.barRatio)
        Check.isGT(value, dlabels.barRatio, 0)
        Check.isLE(value, dlabels.barRatio, 1)
    },
    barOpacity: function (value) {
        Check.isString(value, dlabels.barOpacity)
        Check.notEmpty(value, dlabels.barOpacity)
        Check.isNumber(value, dlabels.barOpacity)
        Check.isGT(value, dlabels.barOpacity, 0)
        Check.isLE(value, dlabels.barOpacity, 1)
    },
    barGrayscale: function (value) {
        Check.isString(value, dlabels.barGrayscale)
        Check.notEmpty(value, dlabels.barGrayscale)
        Check.isNumber(value, dlabels.barGrayscale)
        Check.isGE(value, dlabels.barGrayscale, 0)
        Check.isLE(value, dlabels.barGrayscale, 1)
    },
    bgEnabled: function (value) {
        Check.isBoolean(value, dlabels.bgEnabled)
    },
    bgColor: function (value) {
        Check.isString(value, dlabels.bgColor)
        Check.notEmpty(value, dlabels.bgColor)
        Check.isColor(value, dlabels.bgColor)
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
    orientations,
    styles,
}
