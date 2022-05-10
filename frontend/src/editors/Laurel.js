import Check from './Check'

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
    }
}

function slave(index) {
    return {
        address: `${1 + (index || 0)}`,
        decimals: "0",
        inputs: [input()],
    }
}

function input(index) {
    return { code: "01", name: `Input ${1 + (index || 0)}` }
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
    slave: {
        address: "Slave Address",
        decimals: "Decimal Digits",
    },
    input: {
        code: "Register Name",
        name: "Input Name",
    },
    slaves: {
        address: (i) => `Slave ${i + 1} Address`,
        decimals: (i) => `Slave ${i + 1} Decimal Digits`,
    },
    inputs: {
        code: (i) => `Input ${i + 1} Register Name`,
        name: (i) => `Input ${i + 1} Name`,
    }
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
    slaves: {
        address: (i) => `Non empty integer [0-255]`,
        decimals: (i) => `Non empty integer [0-16]`,
    },
    inputs: {
        code: (i) => `Select the register name from list`,
        name: (i) => `Non empty input name`,
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
        Check.isGT(value, labels.period, 0)
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
        Check.isGT(value, labels.speed, 0)
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
            Check.isLE(value, labels.slaves.decimals(index), 16)
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
    }
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
        Check.nonZeroLength(slave.inputs, "Input")
        slave.inputs.forEach((input, index) => {
            Check.hasProp(input, labels.inputs.code(index), "code")
            checks.inputs.code(index, input.code)
            Check.hasProp(input, labels.inputs.name(index), "name")
            checks.inputs.name(index, input.name)
        })
    })
}

export default {
    config,
    setts,
    slave,
    input,
    labels,
    hints,
    checks,
    validator,
}