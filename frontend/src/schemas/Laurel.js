import Check from '../common/Check'
import Comm from '../common/Comm'
import Schema from '../common/Schema'

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

const protocols = Comm.protocols
const transports = Comm.transports
const serialConfigs = Comm.serialConfigs

function schema() {
    return {
        $type: "object",
        setts: {
            $type: "object",
            proto: {
                value: protocols[0],
                label: "Protocol",
                help: "Select protocol from list",
                check: function (value, label) {
                    Check.inList(value, label, protocols)
                },
            },
            trans: {
                value: transports[0],
                label: "Transport",
                help: "Select transport from list",
                check: function (value, label) {
                    Check.inList(value, label, transports)
                },
            },
            host: {
                value: "127.0.0.1",
                label: "Hostname/IP Address",
                help: "Non empty hostname or IP address",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            port: {
                value: "502",
                label: "TCP Port",
                help: "Non empty integer [0, 65535]",
                check: function (value, label) {
                    Check.isGE(value, label, 0)
                    Check.isLE(value, label, 65535)
                },
            },
            tty: {
                value: "COM1",
                label: "Serial Port Name",
                help: "Select serial port from list"
                    + "\nType begining of name to show completing list"
                    + "\nClick or press ENTER to update list",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            speed: {
                value: "9600",
                label: "Baud Rate",
                help: "Non empty integer > 0",
                check: function (value, label) {
                    Check.isGE(value, label, 1)
                },
            },
            dbpsb: {
                value: serialConfigs[0],
                label: "Config",
                help: "Select config from list",
                check: function (value, label) {
                    Check.inList(value, label, serialConfigs)
                },
            },
            period: {
                value: "10",
                label: "Period (ms)",
                help: "Non empty integer > 0",
                check: function (value, label) {
                    Check.isGT(value, label, 0)
                },
            },
            password: {
                value: "",
                label: "Access Password",
                help: "Optional access password",
                check: function (value, label) {
                    Check.isString(value, label)
                },
            },
        },
        slaves: {
            $type: "array",
            $value: (value) => [value(0)],
            address: {
                value: (index) => `${index + 1}`,
                header: "Slave Address",
                label: "Slave Address",
                help: "Non empty integer [0-255]",
                check: function (value, label) {
                    Check.isGE(value, label, 0)
                    Check.isLE(value, label, 255)
                },
            },
            decimals: {
                value: "0",
                header: "Decimal Digits",
                label: "Decimal Digits",
                help: "Non empty integer [0-16]",
                check: function (value, label) {
                    Check.isGE(value, label, 0)
                    Check.isLE(value, label, 6)
                },
            },
            inputs: {
                $type: "array",
                $value: (value) => [value(0)],
                code: {
                    value: inputCodes[0],
                    label: (index) => `Input ${index + 1} Register Name`,
                    header: "Register Name",
                    help: "Select the register name from list",
                    check: function (value, label) {
                        Check.inList(value, label, inputCodes)
                    },
                },
                name: {
                    value: (index) => `Input ${index + 1}`,
                    label: (index) => `Input ${index + 1} Name`,
                    header: "Input Name",
                    help: "Non empty input name",
                    check: function (value, label) {
                        Check.notEmpty(value, label)
                    },
                },
            },
            outputs: {
                $type: "array",
                $value: [],
                code: {
                    value: outputCodes[0],
                    label: (index) => `Output ${index + 1} Register Name`,
                    header: "Register Name",
                    help: "Select the register name from list",
                    check: function (value, label) {
                        Check.inList(value, label, outputCodes)
                    },
                },
                name: {
                    value: (index) => `Output ${index + 1}`,
                    label: (index) => `Output ${index + 1} Name`,
                    header: "Output Name",
                    help: "Non empty output name",
                    check: function (value, label) {
                        Check.notEmpty(value, label)
                    },
                },
            },
        }
    }
}

function slave(index) {
    const $type = "object"
    const prop = { ...schema().slaves, $type }
    return Schema.value(prop, index)
}

function input(index) {
    const $type = "object"
    const prop = { ...schema().slaves.inputs, $type }
    return Schema.value(prop, index)
}

function output(index) {
    const $type = "object"
    const prop = { ...schema().slaves.outputs, $type }
    return Schema.value(prop, index)
}

export default {
    schema,
    inputCodes,
    outputCodes,
    transports,
    protocols,
    serialConfigs,
    slave,
    input,
    output,
}
