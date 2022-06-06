import Check from '../common/Check'
import Merge from "../common/Merge"

function merge(target) {
    const _initial = config()
    Merge(_initial, target)
    Merge(_initial.setts, target.setts, (name, value) => checks[name](value))
    target.slaves.forEach((target, index) => {
        const _initial = slave(index)
        Merge(_initial, target, (name, value) => checks.slaves[name](index, value))
        target.inputs.forEach((target, index) => {
            const _initial = input(index)
            Merge(_initial, target, (name, value) => checks.inputs[name](index, value))
        })
        target.outputs.forEach((target, index) => {
            const _initial = output(index)
            Merge(_initial, target, (name, value) => checks.outputs[name](index, value))
        })
    })
    return target
}

const inputCodes = [
    "Item 1",
    "Item 2", //timeout for meters
    "Item 3", //timeout for meters
    "Peak",
    "Valley",
    "Alarm 1",
    "Alarm 2",
    "Alarm 3",
    "Alarm 4",
]

const outputCodes = [
    "Device Reset",
    "Function Reset",
    "Latched Alarm Reset",
    "Peak Reset",
    "Valley Reset",
    "Remote Display Reset",
    "Display Item 1",
    "Display Item 2", //timeout for meters
    "Display Item 3", //timeout for meters
    "Display Peak",
    "Display Valley",
    "Tare",
    "Meter Hold",
    "Blank Display",
    "Activate External Input A", //responds with meters, not sure what it does
    "Activate External Input B", //responds with meters, not sure what it does
    // "Display Data",
    // "Data to Item3",
    // "Data to Both",
    // "Force Alarm 1",
    // "Force Alarm 2",
    // "Force Alarm 3",
    // "Force Alarm 4",
]

const transports = ["Socket", "Serial"]
const protocols = ["TCP", "RTU"]

function config() {
    return {
        setts: setts(),
        slaves: [slave()]
    }
}

function setts() {
    return {
        proto: protocols[0],
        trans: transports[0],
        host: "127.0.0.1",
        port: "502",
        tty: "COM1",
        speed: "9600",
        dbpsb: "8N1",
        period: "10",
        password: "",
    }
}

function slave(index) {
    return {
        address: `${1 + (index || 0)}`,
        decimals: "0",
        inputs: [input()],
        outputs: [],
    }
}

function input(index) {
    return { code: inputCodes[0], name: `Input ${1 + (index || 0)}` }
}

function output(index) {
    return { code: outputCodes[0], name: `Output ${1 + (index || 0)}` }
}

const labels = {
    trans: "Transport",
    proto: "Protocol",
    host: "Hostname/IP Address",
    port: "TCP Port",
    period: "Period (ms)",
    password: "Access Password",
    tty: "Serial Port Name",
    speed: "Baud Rate",
    dbpsb: "Config",
    slave: {
        address: "Slave Address",
        decimals: "Decimal Digits",
    },
    input: {
        code: "Register Name",
        name: "Input Name",
    },
    output: {
        code: "Register Name",
        name: "Output Name",
    },
    slaves: {
        address: (i) => `Slave ${i + 1} Address`,
        decimals: (i) => `Slave ${i + 1} Decimal Digits`,
    },
    inputs: {
        code: (i) => `Input ${i + 1} Register Name`,
        name: (i) => `Input ${i + 1} Name`,
    },
    outputs: {
        code: (i) => `Output ${i + 1} Register Name`,
        name: (i) => `Output ${i + 1} Name`,
    },
}

const hints = {
    trans: "Select transport from list",
    proto: "Select protocol from list",
    host: "Non empty hostname or IP address",
    port: "Non empty integer [0, 65535]",
    period: "Non empty integer > 0",
    password: "Optional access password",
    tty: "Select serial port from list"
        + "\nType begining of name to show completing list"
        + "\nClick or press ENTER to update list",
    speed: "Non empty integer > 0",
    dbpsb: "Select config from list",
    slaves: {
        address: () => `Non empty integer [0-255]`,
        decimals: () => `Non empty integer [0-16]`,
    },
    inputs: {
        code: () => `Select the register name from list`,
        name: () => `Non empty input name`,
    },
    outputs: {
        code: () => `Select the register name from list`,
        name: () => `Non empty output name`,
    },
}

const checks = {
    trans: function (value) {
        Check.isString(value, labels.trans)
        Check.notEmpty(value, labels.trans)
        Check.inList(value, labels.trans, transports)
    },
    proto: function (value) {
        Check.isString(value, labels.proto)
        Check.notEmpty(value, labels.proto)
        Check.inList(value, labels.proto, protocols)
    },
    period: function (value) {
        Check.isString(value, labels.period)
        Check.notEmpty(value, labels.period)
        Check.isInteger(value, labels.period)
        Check.isGT(value, labels.period, 0)
    },
    password: function (value) {
        Check.isString(value, labels.period)
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
    tty: function (value) {
        Check.isString(value, labels.tty)
        Check.notEmpty(value, labels.tty)
    },
    speed: function (value) {
        Check.isString(value, labels.speed)
        Check.notEmpty(value, labels.speed)
        Check.isInteger(value, labels.speed)
        Check.isGE(value, labels.speed, 1)
    },
    dbpsb: function (value) {
        Check.isString(value, labels.dbpsb)
        Check.notEmpty(value, labels.dbpsb)
    },
    slaves: {
        address: function (index, value) {
            Check.isString(value, labels.slaves.address(index))
            Check.notEmpty(value, labels.slaves.address(index))
            Check.isGE(value, labels.slaves.address(index), 0)
            Check.isLE(value, labels.slaves.address(index), 255)
        },
        decimals: function (index, value) {
            Check.isString(value, labels.slaves.decimals(index))
            Check.notEmpty(value, labels.slaves.decimals(index))
            Check.isGE(value, labels.slaves.decimals(index), 0)
            Check.isLE(value, labels.slaves.decimals(index), 6)
        },
        inputs: () => { },
        outputs: () => { },
    },
    inputs: {
        code: function (index, value) {
            Check.isString(value, labels.inputs.code(index))
            Check.notEmpty(value, labels.inputs.code(index))
            Check.inList(value, labels.inputs.code(index), inputCodes)
        },
        name: function (index, value) {
            Check.isString(value, labels.inputs.code(index))
            Check.notEmpty(value, labels.inputs.code(index))
        },
    },
    outputs: {
        code: function (index, value) {
            Check.isString(value, labels.outputs.code(index))
            Check.notEmpty(value, labels.outputs.code(index))
            Check.inList(value, labels.outputs.code(index), outputCodes)
        },
        name: function (index, value) {
            Check.isString(value, labels.outputs.code(index))
            Check.notEmpty(value, labels.outputs.code(index))
        },
    },
}

export default {
    transports,
    protocols,
    merge,
    inputCodes,
    outputCodes,
    config,
    setts,
    slave,
    input,
    output,
    labels,
    hints,
    checks,
}
