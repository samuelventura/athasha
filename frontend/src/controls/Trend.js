import Check from '../common/Check'
import Merge from "../common/Merge"

function merge(target) {
    const _initial = data()
    Merge(_initial, target, (name, value) => dchecks[name](value))
    return target
}

function data() {
    return {
        samplePeriod: "1",
        sampleLength: "60",
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
    sample: "Sampling",
    samplePeriod: "Sample Period (s)",
    sampleLength: "Sample Length (s)",
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
    samplePeriod: "Non empty integer > 0",
    sampleLength: "Non empty integer > 0",
    barColor: "Non empty background color #RRGGBB",
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
    samplePeriod: function (value) {
        Check.isString(value, dlabels.samplePeriod)
        Check.notEmpty(value, dlabels.samplePeriod)
        Check.isInteger(value, dlabels.samplePeriod)
        Check.isGT(value, dlabels.samplePeriod, 0)
    },
    sampleLength: function (value) {
        Check.isString(value, dlabels.sampleLength)
        Check.notEmpty(value, dlabels.sampleLength)
        Check.isInteger(value, dlabels.sampleLength)
        Check.isGT(value, dlabels.sampleLength, 0)
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

const type = "Trend"

export default {
    type,
    merge,
    data,
    dlabels,
    dchecks,
    dhints,
}
