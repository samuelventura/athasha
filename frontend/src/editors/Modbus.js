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

function config() {
    return {
        setts: setts(),
        inputs: [input()],
        outputs: [], //only 1 input in visible tab
    }
}

const inputCodes = [
    "01 Coil",
    "02 Input",
    "03 U16BE",
    "03 S16BE",
    "03 U16LE",
    "03 S16LE",
    "03 F32BED",
    "03 F32LED",
    "03 F32BER",
    "03 F32LER",
    "04 U16BE",
    "04 S16BE",
    "04 U16LE",
    "04 S16LE",
    "04 F32BED",
    "04 F32LED",
    "04 F32BER",
    "04 F32LER"
]

const outputCodes = [
    "05 Coil",
    "06 U16BE",
    "06 S16BE",
    "06 U16LE",
    "06 S16LE",
    "16 F32BED",
    "16 F32LED",
    "16 F32BER",
    "16 F32LER",
]

const transports = ["Socket", "Serial"]
const protocols = ["TCP", "RTU"]

function setts() {
    return {
        proto: protocols[0],    //RTU
        trans: transports[0], //Serial
        host: "127.0.0.1",
        port: "502",
        tty: "COM1",
        speed: "9600",
        dbpsb: "8N1",
        period: "10",
        password: "",
    }
}

function input(index) {
    return {
        slave: "1",
        code: inputCodes[0],
        address: `${1 + (index || 0)}`,
        name: `Input ${1 + (index || 0)}`,
        factor: "1",
        offset: "0",
    }
}

function output(index) {
    return {
        slave: "1",
        code: outputCodes[0],
        address: `${1 + (index || 0)}`,
        name: `Output ${1 + (index || 0)}`,
        factor: "1",
        offset: "0",
    }
}
const labels = {
    trans: "Transport",
    proto: "Protocol",
    host: "Hostname/IP Address",
    port: "TCP Port",
    period: "Period (ms)",
    tty: "Serial Port Name",
    speed: "Baud Rate",
    dbpsb: "Config",
    password: "Access Password",
    input: {
        slave: "Slave Address",
        code: "Function Code",
        address: "Input Address",
        name: "Input Name",
        factor: "Value Factor",
        offset: "Value Offset",
    },
    output: {
        slave: "Slave Address",
        code: "Function Code",
        address: "Output Address",
        name: "Output Name",
        factor: "Value Factor",
        offset: "Value Offset",
    },
    inputs: {
        slave: (i) => `Input ${i + 1} Slave Address`,
        code: (i) => `Input ${i + 1} Function Code`,
        address: (i) => `Input ${i + 1} Address`,
        name: (i) => `Input ${i + 1} Name`,
        factor: (i) => `Input ${i + 1} Factor`,
        offset: (i) => `Input ${i + 1} Offset`,
    },
    outputs: {
        slave: (i) => `Output ${i + 1} Slave Address`,
        code: (i) => `Output ${i + 1} Function Code`,
        address: (i) => `Output ${i + 1} Address`,
        name: (i) => `Output ${i + 1} Name`,
        factor: (i) => `Output ${i + 1} Factor`,
        offset: (i) => `Output ${i + 1} Offset`,
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
    inputs: {
        slave: () => "Non empty integer [0, 255]",
        code: () => "Select the function code from list"
            + "\n01 Read Coil"
            + "\n02 Read Input"
            + "\n03 Read Holding Register"
            + "\n04 Read Input Register"
            + "\nF Float"
            + "\nU Unsigned Integer"
            + "\nS Signed Integer"
            + "\n16/32 Number of Bits"
            + "\nBE Big Endian"
            + "\nLE Little Endian"
            + "\nD/R Direct/Reversed",
        address: () => "Non empty integer [1, 65536]",
        name: () => "Non empty input name",
        factor: () => "Non zero number m in f(x)=m*x+b",
        offset: () => "Non empty number b in f(x)=m*x+b",
    },
    outputs: {
        slave: () => "Non empty integer [0, 255]",
        code: () => "Select the function code from list"
            + "\n05 Write Coil"
            + "\n06 Write Register"
            + "\n16 Write Registers"
            + "\nF Float"
            + "\nU Unsigned Integer"
            + "\nS Signed Integer"
            + "\n16/32 Number of Bits"
            + "\nBE Big Endian"
            + "\nLE Little Endian"
            + "\nD/R Direct/Reversed",
        address: () => "Non empty integer [1, 65536]",
        name: () => "Non empty input name",
        factor: () => "Non zero number m in f(x)=m*x+b",
        offset: () => "Non empty number b in f(x)=m*x+b",
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
        Check.isGE(value, labels.period, 1)
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
    inputs: {
        slave: function (index, value) {
            Check.isString(value, labels.inputs.slave(index))
            Check.notEmpty(value, labels.inputs.slave(index))
            Check.isGE(value, labels.inputs.slave(index), 0)
            Check.isLE(value, labels.inputs.slave(index), 255)
        },
        code: function (index, value) {
            Check.isString(value, labels.inputs.code(index))
            Check.notEmpty(value, labels.inputs.code(index))
            Check.inList(value, labels.inputs.code(index), inputCodes)
        },
        address: function (index, value) {
            Check.isString(value, labels.inputs.address(index))
            Check.notEmpty(value, labels.inputs.address(index))
            Check.isGE(value, labels.inputs.address(index), 1)
            Check.isLE(value, labels.inputs.address(index), 65536)
        },
        name: function (index, value) {
            Check.isString(value, labels.inputs.name(index))
            Check.notEmpty(value, labels.inputs.name(index))
        },
        factor: function (index, value) {
            Check.isString(value, labels.inputs.factor(index))
            Check.notEmpty(value, labels.inputs.factor(index))
            Check.isNumber(value, labels.inputs.factor(index))
            Check.notZero(value, labels.inputs.factor(index))
        },
        offset: function (index, value) {
            Check.isString(value, labels.inputs.offset(index))
            Check.notEmpty(value, labels.inputs.offset(index))
            Check.isNumber(value, labels.inputs.offset(index))
        },
    },
    outputs: {
        slave: function (index, value) {
            Check.isString(value, labels.outputs.slave(index))
            Check.notEmpty(value, labels.outputs.slave(index))
            Check.isGE(value, labels.outputs.slave(index), 0)
            Check.isLE(value, labels.outputs.slave(index), 255)
        },
        code: function (index, value) {
            Check.isString(value, labels.outputs.code(index))
            Check.notEmpty(value, labels.outputs.code(index))
            Check.inList(value, labels.outputs.code(index), outputCodes)
        },
        address: function (index, value) {
            Check.isString(value, labels.outputs.address(index))
            Check.notEmpty(value, labels.outputs.address(index))
            Check.isGE(value, labels.outputs.address(index), 1)
            Check.isLE(value, labels.outputs.address(index), 65536)
        },
        name: function (index, value) {
            Check.isString(value, labels.outputs.name(index))
            Check.notEmpty(value, labels.outputs.name(index))
        },
        factor: function (index, value) {
            Check.isString(value, labels.outputs.factor(index))
            Check.notEmpty(value, labels.outputs.factor(index))
            Check.isNumber(value, labels.outputs.factor(index))
            Check.notZero(value, labels.outputs.factor(index))
        },
        offset: function (index, value) {
            Check.isString(value, labels.outputs.offset(index))
            Check.notEmpty(value, labels.outputs.offset(index))
            Check.isNumber(value, labels.outputs.offset(index))
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
    input,
    output,
    labels,
    hints,
    checks,
}