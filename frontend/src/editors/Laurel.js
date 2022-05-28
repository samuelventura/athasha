import Check from './Check'

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

function config() {
    return {
        setts: setts(),
        slaves: [slave()]
    }
}

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

function slave(index) {
    return {
        address: `${1 + (index || 0)}`,
        decimals: "0",
        inputs: [input()],
        outputs: [],
    }
}

function input(index) {
    return { code: "Item 1", name: `Input ${1 + (index || 0)}` }
}

function output(index) {
    return { code: "Device Reset", name: `Output ${1 + (index || 0)}` }
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
        + "\nPress ENTER to update list",
    speed: "Non empty integer > 0",
    dbpsb: "Select config from list",
    slaves: {
        address: (i) => `Non empty integer [0-255]`,
        decimals: (i) => `Non empty integer [0-16]`,
    },
    inputs: {
        code: (i) => `Select the register name from list`,
        name: (i) => `Non empty input name`,
    },
    outputs: {
        code: (i) => `Select the register name from list`,
        name: (i) => `Non empty output name`,
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
    },
    inputs: {
        code: function (index, value) {
            Check.isString(value, labels.inputs.code(index))
            Check.notEmpty(value, labels.inputs.code(index))
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
        },
        name: function (index, value) {
            Check.isString(value, labels.outputs.code(index))
            Check.notEmpty(value, labels.outputs.code(index))
        },
    },
}

function validator({ setts, slaves }) {
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
    Check.isArray(slaves, "Slaves")
    Check.nonZeroLength(slaves, "Slaves")
    slaves.forEach((slave, index) => {
        Check.hasProp(slave, labels.slaves.address(index), "address")
        checks.slaves.address(index, slave.address)
        Check.hasProp(slave, labels.slaves.decimals(index), "decimals")
        checks.slaves.decimals(index, slave.decimals)
        Check.hasProp(slave, "Inputs", "inputs")
        Check.isArray(slave.inputs, "Input")
        // Check.nonZeroLength(slave.inputs, "Input")
        slave.inputs.forEach((input, index) => {
            Check.hasProp(input, labels.inputs.code(index), "code")
            checks.inputs.code(index, input.code)
            Check.hasProp(input, labels.inputs.name(index), "name")
            checks.inputs.name(index, input.name)
        })
        Check.hasProp(slave, "Outputs", "outputs")
        Check.isArray(slave.outputs, "Output")
        // Check.nonZeroLength(slave.outputs, "Output")
        slave.outputs.forEach((output, index) => {
            Check.hasProp(output, labels.outputs.code(index), "code")
            checks.outputs.code(index, output.code)
            Check.hasProp(output, labels.outputs.name(index), "name")
            checks.outputs.name(index, output.name)
        })
    })
}

export default {
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
    validator,
}
