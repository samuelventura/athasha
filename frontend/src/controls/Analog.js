import Check from '../editors/Check'
import Merge from "../tools/Merge"

function merge(target) {
    const _initial = data()
    Merge(_initial, target, (name, value) => dchecks[name](value))
    return target
}

function data() {
    return {
        orientation: "Vertical",
        displayRangeZero: "0",
        displayRangeSpan: "100",
        inputScaleFactor: "1",
        inputScaleOffset: "0",
        inputRangeMin: "0",
        inputRangeMax: "10000",
        normalRangeMin: "4000",
        normalRangeMax: "6000",
        warningRangeMin: "2000",
        warningRangeMax: "8000",
        criticalRangeMin: "0",
        criticalRangeMax: "10000",
    }
}

const dlabels = {
    orientation: "Orientation",
    displayRange: "Display Range",
    displayRangeZero: "Display Range Zero",
    displayRangeSpan: "Display Range Span",
    inputScale: "Input Scale",
    inputScaleFactor: "Input Scale Factor",
    inputScaleOffset: "Input Scale Offset",
    inputRange: "Input Range",
    inputRangeMin: "Input Range Minimum",
    inputRangeMax: "Input Range Maximum",
    normalRange: "Normal Range",
    normalRangeMin: "Normal Range Minimum",
    normalRangeMax: "Normal Range Maximum",
    warningRange: "Warning Range",
    warningRangeMin: "Warning Range Minimum",
    warningRangeMax: "Warning Range Maximum",
    criticalRange: "Critical Range",
    criticalRangeMin: "Critical Range Minimum",
    criticalRangeMax: "Critical Range Maximum",
}

const dhints = {
    orientation: "Bar orientation",
    displayRangeZero: "Non empty number [-100, 100]",
    displayRangeSpan: "Non empty number (0, 100]",
    inputScaleFactor: "Non empty number m in f(x)=mx+b",
    inputScaleOffset: "Non empty number b in f(x)=mx+b",
    inputRangeMin: "Non empty number",
    inputRangeMax: "Non empty number",
}

const dchecks = {
    orientation: function (value) {
        Check.isString(value, dlabels.orientation)
        Check.notEmpty(value, dlabels.orientation)
    },
    displayRangeZero: function (value) {
        Check.isString(value, dlabels.displayRangeZero)
        Check.notEmpty(value, dlabels.displayRangeZero)
        Check.isNumber(value, dlabels.displayRangeZero)
        Check.isGE(value, dlabels.displayRangeZero, -100)
        Check.isLE(value, dlabels.displayRangeZero, +100)
    },
    displayRangeSpan: function (value) {
        Check.isString(value, dlabels.displayRangeSpan)
        Check.notEmpty(value, dlabels.displayRangeSpan)
        Check.isNumber(value, dlabels.displayRangeSpan)
        Check.isGT(value, dlabels.displayRangeSpan, 0)
        Check.isLE(value, dlabels.displayRangeSpan, 100)
    },
    inputScaleFactor: function (value) {
        Check.isString(value, dlabels.inputScaleFactor)
        Check.notEmpty(value, dlabels.inputScaleFactor)
        Check.isNumber(value, dlabels.inputScaleFactor)
    },
    inputScaleOffset: function (value) {
        Check.isString(value, dlabels.inputScaleOffset)
        Check.notEmpty(value, dlabels.inputScaleOffset)
        Check.isNumber(value, dlabels.inputScaleOffset)
    },
    inputRangeMin: function (value) {
        Check.isString(value, dlabels.inputRangeMin)
        Check.notEmpty(value, dlabels.inputRangeMin)
        Check.isNumber(value, dlabels.inputRangeMin)
    },
    inputRangeMax: function (value) {
        Check.isString(value, dlabels.inputRangeMax)
        Check.notEmpty(value, dlabels.inputRangeMax)
        Check.isNumber(value, dlabels.inputRangeMax)
    },
    normalRangeMin: function (value) {
        Check.isString(value, dlabels.normalRangeMin)
        Check.notEmpty(value, dlabels.normalRangeMin)
        Check.isNumber(value, dlabels.normalRangeMin)
    },
    normalRangeMax: function (value) {
        Check.isString(value, dlabels.normalRangeMax)
        Check.notEmpty(value, dlabels.normalRangeMax)
        Check.isNumber(value, dlabels.normalRangeMax)
    },
    warningRangeMin: function (value) {
        Check.isString(value, dlabels.warningRangeMin)
        Check.notEmpty(value, dlabels.warningRangeMin)
        Check.isNumber(value, dlabels.warningRangeMin)
    },
    warningRangeMax: function (value) {
        Check.isString(value, dlabels.warningRangeMax)
        Check.notEmpty(value, dlabels.warningRangeMax)
        Check.isNumber(value, dlabels.warningRangeMax)
    },
    criticalRangeMin: function (value) {
        Check.isString(value, dlabels.criticalRangeMin)
        Check.notEmpty(value, dlabels.criticalRangeMin)
        Check.isNumber(value, dlabels.criticalRangeMin)
    },
    criticalRangeMax: function (value) {
        Check.isString(value, dlabels.criticalRangeMax)
        Check.notEmpty(value, dlabels.criticalRangeMax)
        Check.isNumber(value, dlabels.criticalRangeMax)
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
