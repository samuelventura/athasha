import Check from './Check'

function config() {
    return {
        setts: setts(),
        inputs: [input()],
        outputs: [output()],
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

function setts() {
    return {
        proto: "TCP",    //RTU
        trans: "Socket", //Serial
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
        code: "01 Coil",
        address: `${1 + (index || 0)}`,
        name: `Input ${1 + (index || 0)}`,
        factor: "1",
        offset: "0",
        decimals: "0",
    }
}

function output(index) {
    return {
        slave: "1",
        code: "05 Coil",
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
        decimals: "Number of Decimals",
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
        decimals: (i) => `Input ${i + 1} Number of Decimals`,
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
        + "\nPress ENTER to update list",
    speed: "Non empty integer > 0",
    dbpsb: "Select config from list",
    inputs: {
        slave: (i) => "Non empty integer [0, 255]",
        code: (i) => "Select the function code from list"
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
        address: (i) => "Non empty integer [1, 65536]",
        name: (i) => "Non empty input name",
        factor: (i) => "Non empty number m in f(x)=m*x+b",
        offset: (i) => "Non empty number b in f(x)=m*x+b",
        decimals: (i) => "Non empty integer [0, 15]",
    },
    outputs: {
        slave: (i) => "Non empty integer [0, 255]",
        code: (i) => "Select the function code from list"
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
        address: (i) => "Non empty integer [1, 65536]",
        name: (i) => "Non empty input name",
        factor: (i) => "Non empty number m in f(x)=m*x+b",
        offset: (i) => "Non empty number b in f(x)=m*x+b",
    },
}

const checks = {
    trans: function (value) {
        Check.isString(value, labels.trans)
        Check.notEmpty(value, labels.trans)
    },
    proto: function (value) {
        Check.isString(value, labels.proto)
        Check.notEmpty(value, labels.proto)
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
        },
        offset: function (index, value) {
            Check.isString(value, labels.inputs.offset(index))
            Check.notEmpty(value, labels.inputs.offset(index))
            Check.isNumber(value, labels.inputs.offset(index))
        },
        decimals: function (index, value) {
            Check.isString(value, labels.decimals)
            Check.notEmpty(value, labels.decimals)
            Check.isInteger(value, labels.decimals)
            Check.isGE(value, labels.decimals, 0)
            Check.isLE(value, labels.decimals, 15)
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
        },
        offset: function (index, value) {
            Check.isString(value, labels.outputs.offset(index))
            Check.notEmpty(value, labels.outputs.offset(index))
            Check.isNumber(value, labels.outputs.offset(index))
        },
    },
}

function validator({ setts, inputs, outputs }) {
    Check.hasProp(setts, "Setts", "trans")
    Check.hasProp(setts, "Setts", "proto")
    Check.hasProp(setts, "Setts", "host")
    Check.hasProp(setts, "Setts", "port")
    Check.hasProp(setts, "Setts", "period")
    Check.hasProp(setts, "Setts", "tty")
    Check.hasProp(setts, "Setts", "speed")
    Check.hasProp(setts, "Setts", "dbpsb")
    checks.trans(setts.trans)
    checks.proto(setts.proto)
    checks.host(setts.host)
    checks.port(setts.port)
    checks.period(setts.period)
    checks.tty(setts.tty)
    checks.speed(setts.speed)
    checks.dbpsb(setts.dbpsb)
    Check.isArray(inputs, "Inputs")
    Check.nonZeroLength(inputs, "Inputs")
    inputs.forEach((input, index) => {
        Check.hasProp(input, labels.inputs.slave(index), "slave")
        checks.inputs.slave(index, input.slave)
        Check.hasProp(input, labels.inputs.code(index), "code")
        checks.inputs.code(index, input.code)
        Check.hasProp(input, labels.inputs.address(index), "address")
        checks.inputs.address(index, input.address)
        Check.hasProp(input, labels.inputs.name(index), "name")
        checks.inputs.name(index, input.name)
        Check.hasProp(input, labels.inputs.factor(index), "factor")
        checks.inputs.factor(index, input.factor)
        Check.hasProp(input, labels.inputs.offset(index), "offset")
        checks.inputs.offset(index, input.offset)
        Check.hasProp(input, labels.inputs.decimals(index), "decimals")
        checks.inputs.decimals(index, input.decimals)
    })
    Check.isArray(outputs, "Output")
    Check.nonZeroLength(outputs, "Output")
    outputs.forEach((output, index) => {
        Check.hasProp(output, labels.outputs.slave(index), "slave")
        checks.outputs.slave(index, output.slave)
        Check.hasProp(output, labels.outputs.code(index), "code")
        checks.outputs.code(index, output.code)
        Check.hasProp(output, labels.outputs.address(index), "address")
        checks.outputs.address(index, output.address)
        Check.hasProp(output, labels.outputs.name(index), "name")
        checks.outputs.name(index, output.name)
        Check.hasProp(output, labels.outputs.factor(index), "factor")
        checks.outputs.factor(index, output.factor)
        Check.hasProp(output, labels.outputs.offset(index), "offset")
        checks.outputs.offset(index, output.offset)
    })
}

export default {
    inputCodes,
    outputCodes,
    config,
    setts,
    input,
    output,
    labels,
    hints,
    checks,
    validator,
}