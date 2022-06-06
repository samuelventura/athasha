import Check from '../common/Check'
import Merge from "../common/Merge"

function merge(target) {
    const _initial = config()
    Merge(_initial, target)
    Merge(_initial.setts, target.setts, (name, value) => checks[name](value))
    target.inputs.forEach((target, index) => {
        const _initial = input(index)
        Merge(_initial, target, (name, value) => checks.inputs[name](index, value))
    })
    target.outputs.forEach((target, index) => {
        const _initial = output(index)
        Merge(_initial, target, (name, value) => checks.outputs[name](index, value))
    })
    return target
}

const types = ["Snap"]
const inputCodes = ["4ch Digital", "4ch Analog"]
const outputCodes = ["4ch Digital", "4ch Analog"]

function config() {
    return {
        setts: setts(),
        inputs: [input()],
        outputs: [], //only 1 input in visible tab
    }
}

function setts() {
    return {
        type: types[0],
        host: "127.0.0.1",
        port: "502",
        period: "10",
        password: "",
        slave: "1",
    }
}

function input(index) {
    return {
        code: inputCodes[0],
        module: "0",
        number: "1",
        name: `Input ${1 + (index || 0)}`,
    }
}

function output(index) {
    return {
        code: outputCodes[0],
        module: "0",
        number: "1",
        name: `Output ${1 + (index || 0)}`,
    }
}

const labels = {
    type: "Product Family",
    host: "Hostname/IP Address",
    port: "TCP Port",
    period: "Period (ms)",
    password: "Access Password",
    slave: "Slave Address",
    input: {
        code: "Input Type",
        module: "Module Number",
        number: "Point Number",
        name: "Input Name",
    },
    inputs: {
        code: (i) => `Input ${i + 1} Type`,
        module: (i) => `Input ${i + 1} Module Number`,
        number: (i) => `Input ${i + 1} Point Number`,
        name: (i) => `Input ${i + 1} Name`,
    },
    output: {
        code: "Output Type",
        module: "Module Number",
        number: "Point Number",
        name: "Output Name",
    },
    outputs: {
        code: (i) => `Output ${i + 1} Type`,
        module: (i) => `Output ${i + 1} Module Number`,
        number: (i) => `Output ${i + 1} Point Number`,
        name: (i) => `Output ${i + 1} Name`,
    },
}

const hints = {
    type: "Select product family from list",
    host: "Non empty hostname or IP address",
    port: "Non empty integer [0, 65535]",
    period: "Non empty integer > 0",
    password: "Optional access password",
    slave: "Non empty integer [0, 255]",
    inputs: {
        code: () => "Select the input type from list",
        module: () => "Non empty integer [0, 15]",
        number: () => "Non empty integer [1, 4]",
        name: () => "Non empty input name",
    },
    outputs: {
        code: () => "Select the output type from list",
        module: () => "Non empty integer [0, 15]",
        number: () => "Non empty integer [1, 4]",
        name: () => "Non empty output name",
    },
}

const checks = {
    type: function (value) {
        Check.isString(value, labels.type)
        Check.notEmpty(value, labels.type)
        Check.inList(value, labels.type, types)
    },
    host: function (value) {
        Check.isString(value, labels.host)
        Check.notEmpty(value, labels.host)
    },
    port: function (value) {
        Check.isString(value, labels.port)
        Check.notEmpty(value, labels.port)
        Check.isInteger(value, labels.port)
        Check.isGE(value, labels.port, 0)
        Check.isLE(value, labels.port, 65535)
    },
    period: function (value) {
        Check.isString(value, labels.period)
        Check.notEmpty(value, labels.period)
        Check.isInteger(value, labels.period)
        Check.isGE(value, labels.period, 1)
    },
    password: function (value) {
        Check.isString(value, labels.period)
    },
    slave: function (value) {
        Check.isString(value, labels.slave)
        Check.notEmpty(value, labels.slave)
        Check.isInteger(value, labels.slave)
        Check.isGE(value, labels.slave, 0)
        Check.isLE(value, labels.slave, 255)
    },
    inputs: {
        code: function (index, value) {
            Check.isString(value, labels.inputs.code(index))
            Check.notEmpty(value, labels.inputs.code(index))
            Check.inList(value, labels.inputs.code(index), inputCodes)
        },
        module: function (index, value) {
            Check.isString(value, labels.inputs.module(index))
            Check.notEmpty(value, labels.inputs.module(index))
            Check.isGE(value, labels.inputs.module(index), 0)
            Check.isLE(value, labels.inputs.module(index), 15)
        },
        number: function (index, value) {
            Check.isString(value, labels.inputs.number(index))
            Check.notEmpty(value, labels.inputs.number(index))
            Check.isGE(value, labels.inputs.number(index), 1)
            Check.isLE(value, labels.inputs.number(index), 4)
        },
        name: function (index, value) {
            Check.isString(value, labels.inputs.name(index))
            Check.notEmpty(value, labels.inputs.name(index))
        },
    },
    outputs: {
        code: function (index, value) {
            Check.isString(value, labels.outputs.code(index))
            Check.notEmpty(value, labels.outputs.code(index))
            Check.inList(value, labels.outputs.code(index), outputCodes)
        },
        module: function (index, value) {
            Check.isString(value, labels.outputs.module(index))
            Check.notEmpty(value, labels.outputs.module(index))
            Check.isGE(value, labels.outputs.module(index), 0)
            Check.isLE(value, labels.outputs.module(index), 15)
        },
        number: function (index, value) {
            Check.isString(value, labels.outputs.number(index))
            Check.notEmpty(value, labels.outputs.number(index))
            Check.isGE(value, labels.outputs.number(index), 1)
            Check.isLE(value, labels.outputs.number(index), 4)
        },
        name: function (index, value) {
            Check.isString(value, labels.outputs.name(index))
            Check.notEmpty(value, labels.outputs.name(index))
        },
    },
}

export default {
    types,
    merge,
    inputCodes,
    outputCodes,
    config,
    setts,
    input,
    output,
    labels,
    hints,
    checks,
}