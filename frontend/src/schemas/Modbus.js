import Check from '../common/Check'
import Comm from '../common/Comm'
import Schema from '../common/Schema'

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

    "03 S32BED",
    "03 S32LED",
    "03 S32BER",
    "03 S32LER",

    "03 U32BED",
    "03 U32LED",
    "03 U32BER",
    "03 U32LER",

    "04 U16BE",
    "04 S16BE",
    "04 U16LE",
    "04 S16LE",

    "04 F32BED",
    "04 F32LED",
    "04 F32BER",
    "04 F32LER",

    "04 S32BED",
    "04 S32LED",
    "04 S32BER",
    "04 S32LER",

    "04 U32BED",
    "04 U32LED",
    "04 U32BER",
    "04 U32LER",
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

    "16 S32BED",
    "16 S32LED",
    "16 S32BER",
    "16 S32LER",

    "16 U32BED",
    "16 U32LED",
    "16 U32BER",
    "16 U32LER",
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
                value: "8N1",
                label: "Config",
                help: "Select config from list",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            period: {
                value: "10",
                label: "Period (ms)",
                help: "Non empty integer > 0",
                check: function (value, label) {
                    Check.isInteger(value, label)
                    Check.isGE(value, label, 1)
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
        inputs: {
            $type: "array",
            $value: (value) => [value(0)],
            slave: {
                value: "1",
                header: "Slave Address",
                label: (index) => `Input ${index + 1} Slave Address`,
                help: "Non empty integer [0, 255]",
                check: function (value, label) {
                    Check.isGE(value, label, 0)
                    Check.isLE(value, label, 255)
                },
            },
            code: {
                value: inputCodes[0],
                header: "Function Code",
                label: (index) => `Input ${index + 1} Function Code`,
                help: "Select the function code from list"
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
                check: function (value, label) {
                    Check.inList(value, label, inputCodes)
                },
            },
            address: {
                value: (index) => `${index + 1}`,
                header: "Input Address",
                label: (index) => `Input ${index + 1} Address`,
                help: "Non empty integer [1, 65536]",
                check: function (value, label) {
                    Check.isGE(value, label, 1)
                    Check.isLE(value, label, 65536)
                },
            },
            name: {
                value: (index) => `Input ${index + 1}`,
                header: "Input Name",
                label: (index) => `Input ${index + 1} Name`,
                help: "Non empty input name",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            factor: {
                value: "1",
                header: "Value Factor",
                label: (index) => `Input ${index + 1} Factor`,
                help: "Non zero number m in f(x)=m*x+b",
                check: function (value, label) {
                    Check.notZero(value, label)
                },
            },
            offset: {
                value: "0",
                header: "Value Offset",
                label: (index) => `Input ${index + 1} Offset`,
                help: "Non empty number b in f(x)=m*x+b",
                check: function (value, label) {
                    Check.isNumber(value, label)
                },
            },
        },
        outputs: {
            $type: "array",
            $value: [],
            slave: {
                value: "1",
                header: "Slave Address",
                label: (index) => `Output ${index + 1} Slave Address`,
                help: "Non empty integer [0, 255]",
                check: function (value, label) {
                    Check.isGE(value, label, 0)
                    Check.isLE(value, label, 255)
                },
            },
            code: {
                value: outputCodes[0],
                header: "Function Code",
                label: (index) => `Output ${index + 1} Function Code`,
                help: "Select the function code from list"
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
                check: function (value, label) {
                    Check.inList(value, label, outputCodes)
                },
            },
            address: {
                value: (index) => `${index + 1}`,
                header: "Output Address",
                label: (index) => `Output ${index + 1} Address`,
                help: "Non empty integer [1, 65536]",
                check: function (value, label) {
                    Check.isGE(value, label, 1)
                    Check.isLE(value, label, 65536)
                },
            },
            name: {
                value: (index) => `Output ${index + 1}`,
                header: "Output Name",
                label: (index) => `Output ${index + 1} Name`,
                help: "Non empty input name",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            factor: {
                value: "1",
                header: "Value Factor",
                label: (index) => `Output ${index + 1} Factor`,
                help: "Non zero number m in f(x)=m*x+b",
                check: function (value, label) {
                    Check.notZero(value, label)
                },
            },
            offset: {
                value: "0",
                header: "Value Offset",
                label: (index) => `Output ${index + 1} Offset`,
                help: "Non empty number b in f(x)=m*x+b",
                check: function (value, label) {
                    Check.isNumber(value, label)
                },
            },
        },
    }
}

function input(index) {
    const $type = "object"
    const prop = { ...schema().inputs, $type }
    return Schema.value(prop, index)
}

function output(index) {
    const $type = "object"
    const prop = { ...schema().outputs, $type }
    return Schema.value(prop, index)
}

export default {
    schema,
    inputCodes,
    outputCodes,
    transports,
    protocols,
    serialConfigs,
    input,
    output,
}
