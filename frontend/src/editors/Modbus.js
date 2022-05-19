import Check from './Check'

function config() {
    return {
        setts: setts(),
        inputs: [input()]
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
    }
}

function input(index) {
    return {
        slave: "1",
        code: "01",
        address: `${index || 0}`,
        name: `Input ${1 + (index || 0)}`,
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
    input: {
        slave: "Slave Address",
        code: "Function Code",
        address: "Input Address",
        name: "Input Name",
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
}

const hints = {
    trans: "Select transport from list",
    proto: "Select protocol from list",
    host: "Non empty hostname or IP address",
    port: "Non empty integer [0, 65535]",
    period: "Non empty integer > 0",
    tty: "Select serial port from list\nType begining of name to show completing list\nPress ENTER to update list",
    speed: "Non empty integer > 0",
    dbpsb: "Select config from list",
    inputs: {
        slave: (i) => `Non empty integer [0, 255]`,
        code: (i) => `Select the function code from list`,
        address: (i) => `Non empty integer [0, 65535]`,
        name: (i) => `Non empty input name`,
        factor: (i) => `Non empty number m in f(x)=m*x+b`,
        offset: (i) => `Non empty number b in f(x)=m*x+b`,
    }
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
            Check.isGE(value, labels.inputs.address(index), 0)
            Check.isLE(value, labels.inputs.address(index), 65535)
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
    },
}

function validator({ setts, inputs }) {
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
    })
}

export default {
    config,
    setts,
    input,
    labels,
    hints,
    checks,
    validator,
}