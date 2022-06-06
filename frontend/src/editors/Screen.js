import Check from '../common/Check'
import Merge from "../tools/Merge"
import Label from '../controls/Label.js'
import Analog from '../controls/Analog.js'
import Image from '../controls/Image.js'
import Trend from '../controls/Trend.js'
import { v4 as uuidv4 } from 'uuid'

const controlMap = {}
controlMap[Label.type] = Label
controlMap[Image.type] = Image
controlMap[Analog.type] = Analog
controlMap[Trend.type] = Trend

function merge(target) {
    const _initial = config()
    Merge(_initial, target)
    Merge(_initial.setts, target.setts, (name, value) => checks[name](value))
    target.controls.forEach((target, index) => {
        const _initial = control(index) //new uuid each time
        Merge(_initial, target, (name, value) => cchecks[name](value))
        Merge(_initial.setts, target.setts, (name, value) => cschecks[name](value))
        const initial = controlMap[target.type]
        if (initial.merge) {
            target.data = initial.merge(target.data)
        }
    })
    return target
}

function id() {
    return uuidv4()
}

function config() {
    return {
        setts: setts(),
        controls: [],
        inputs: [],
    }
}

const scales = ["Fit", "Stretch"]
const aligns = ["Center", "Start", "End"]
const clicks = ["Fixed Value", "Value Prompt"]

function setts() {
    return {
        password: "",
        period: "25",
        scale: scales[0],
        align: aligns[0],
        width: '640',
        height: '480',
        gridX: '160',
        gridY: '120',
        backColor: "#ffffff",
        hoverColor: "#808080",
    }
}

function control() {
    return {
        id: id(),
        type: "none",
        setts: csetts(),
        data: {},
    }
}

function selected() {
    return {
        index: -1,
        control: {},
    }
}

function csetts() {
    return {
        posX: '0',
        posY: '0',
        width: '1',
        height: '1',
        title: "",
        input: "",
        defValue: "0",
        defEnabled: false,
        output: "",
        click: clicks[0],
        value: "0",
        prompt: "Enter Value",
        inputFactor: "1",
        inputOffset: "0",
        outputFactor: "1",
        outputOffset: "0",
    }
}

const labels = {
    id: "UUID",
    password: "Access Password",
    period: "Period (ms)",
    scale: "Scale",
    align: "Align",
    width: "Width",
    height: "Height",
    gridX: "Grid X",
    gridY: "Grid Y",
    backColor: "Back Color",
    hoverColor: "Hover Color",
}

const hints = {
    password: "Optional access password",
    period: "Non empty integer update period > 0",
    scale: "Select scale from list",
    align: "Select alignment from list",
    width: "Non empty integer > 0",
    height: "Non empty integer > 0",
    gridX: "Non empty integer > 0",
    gridY: "Non empty integer > 0",
    backColor: "Non empty backgroung color #RRGGBB",
    hoverColor: "Non empty hover color #RRGGBB",
}

const clabels = {
    position: "Position",
    posX: "Position X",
    posY: "Position Y",
    dimensions: "Dimensions",
    width: "Width",
    height: "Height",
    title: "Tooltip",
    input: "Input",
    defValue: "Input Default",
    defEnabled: "Input Default Enabled",
    output: "Output",
    click: "On Click",
    value: "Fixed Value",
    prompt: "Value Prompt",
    inputScale: "Input Scale",
    inputFactor: "Input Scale Factor",
    inputOffset: "Input Scale Offset",
    outputScale: "Output Scale",
    outputFactor: "Output Scale Factor",
    outputOffset: "Output Scale Offset",
}

const chints = {
    posX: "Non empty integer >= 0",
    posY: "Non empty integer >= 0",
    width: "Non empty integer > 0",
    height: "Non empty integer > 0",
    title: "Optional tooltip",
    input: "Select optional input from list",
    defValue: "Non empty number",
    defEnabled: "Check to enable input default",
    output: "Select optional output from list",
    click: "Select on click action",
    value: "Non empty fixed value number",
    prompt: "Non empty value prompt",
    inputFactor: "Non empty number m in f(x)=mx+b",
    inputOffset: "Non empty number b in f(x)=mx+b",
    outputFactor: "Non empty number m in f(x)=mx+b",
    outputOffset: "Non empty number b in f(x)=mx+b",
}

const cchecks = {
    id: function (value) {
        Check.isString(value, labels.id)
        Check.notEmpty(value, labels.id)
    },
    type: () => { },
    setts: () => { },
    data: () => { },
}

const cschecks = {
    posX: function (value) {
        Check.isString(value, clabels.posX)
        Check.notEmpty(value, clabels.posX)
        Check.isInteger(value, clabels.posX)
        Check.isGE(value, clabels.posX, 0)
    },
    posY: function (value) {
        Check.isString(value, clabels.posY)
        Check.notEmpty(value, clabels.posY)
        Check.isInteger(value, clabels.posY)
        Check.isGE(value, clabels.posY, 0)
    },
    width: function (value) {
        Check.isString(value, clabels.width)
        Check.notEmpty(value, clabels.width)
        Check.isInteger(value, clabels.width)
        Check.isGE(value, clabels.width, 1)
    },
    height: function (value) {
        Check.isString(value, clabels.height)
        Check.notEmpty(value, clabels.height)
        Check.isInteger(value, clabels.height)
        Check.isGE(value, clabels.height, 1)
    },
    title: function (value) {
        Check.isString(value, clabels.title)
    },
    input: function (value) {
        Check.isString(value, clabels.input)
    },
    defValue: function (value) {
        Check.isString(value, clabels.defValue)
        Check.notEmpty(value, clabels.defValue)
        Check.isNumber(value, clabels.defValue)
    },
    defEnabled: function (value) {
        Check.isBoolean(value, clabels.defEnabled)
    },
    output: function (value) {
        Check.isString(value, clabels.output)
    },
    click: function (value) {
        Check.isString(value, clabels.click)
        Check.notEmpty(value, clabels.click)
        Check.inList(value, clabels.click, clicks)
    },
    value: function (value) {
        Check.isString(value, clabels.value)
        Check.notEmpty(value, clabels.value)
        Check.isNumber(value, clabels.value)
    },
    prompt: function (value) {
        Check.isString(value, clabels.prompt)
        Check.notEmpty(value, clabels.prompt)
    },
    inputFactor: function (value) {
        Check.isString(value, clabels.inputFactor)
        Check.notEmpty(value, clabels.inputFactor)
        Check.isNumber(value, clabels.inputFactor)
    },
    inputOffset: function (value) {
        Check.isString(value, clabels.inputOffset)
        Check.notEmpty(value, clabels.inputOffset)
        Check.isNumber(value, clabels.inputOffset)
    },
    outputFactor: function (value) {
        Check.isString(value, clabels.outputFactor)
        Check.notEmpty(value, clabels.outputFactor)
        Check.isNumber(value, clabels.outputFactor)
    },
    outputOffset: function (value) {
        Check.isString(value, clabels.outputOffset)
        Check.notEmpty(value, clabels.outputOffset)
        Check.isNumber(value, clabels.outputOffset)
    },
}

const checks = {
    password: function (value) {
        Check.isString(value, labels.password)
        //Check.notEmpty(value, labels.password)
    },
    period: function (value) {
        Check.isString(value, labels.period)
        Check.notEmpty(value, labels.period)
        Check.isInteger(value, labels.period)
        Check.isGE(value, labels.period, 1)
    },
    scale: function (value) {
        Check.isString(value, labels.scale)
        Check.notEmpty(value, labels.scale)
        Check.inList(value, labels.scale, scales)
    },
    align: function (value) {
        Check.isString(value, labels.align)
        Check.notEmpty(value, labels.align)
        Check.inList(value, labels.align, aligns)
    },
    width: function (value) {
        Check.isString(value, labels.width)
        Check.notEmpty(value, labels.width)
        Check.isInteger(value, labels.width)
        Check.isGE(value, labels.width, 1)
    },
    height: function (value) {
        Check.isString(value, labels.height)
        Check.notEmpty(value, labels.height)
        Check.isInteger(value, labels.height)
        Check.isGE(value, labels.height, 1)
    },
    gridX: function (value) {
        Check.isString(value, labels.gridX)
        Check.notEmpty(value, labels.gridX)
        Check.isInteger(value, labels.gridX)
        Check.isGE(value, labels.gridX, 1)
    },
    gridY: function (value) {
        Check.isString(value, labels.gridY)
        Check.notEmpty(value, labels.gridY)
        Check.isInteger(value, labels.gridY)
        Check.isGE(value, labels.gridY, 1)
    },
    backColor: function (value) {
        Check.isString(value, labels.backColor)
        Check.notEmpty(value, labels.backColor)
        Check.isColor(value, labels.backColor)
    },
    hoverColor: function (value) {
        Check.isString(value, labels.hoverColor)
        Check.notEmpty(value, labels.hoverColor)
        Check.isColor(value, labels.hoverColor)
    },
}

export default {
    id,
    merge,
    selected,
    config,
    setts,
    control,
    csetts,
    labels,
    hints,
    checks,
    clabels,
    chints,
    cschecks,
    scales,
    aligns,
    clicks,
}
