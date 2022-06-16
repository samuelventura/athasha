import Check from '../common/Check'
import Schema from '../common/Schema'

const types = [
    "SNAP-PAC-R1",
    "SNAP-PAC-EB1",
    "SNAP-PAC-R2",
    "SNAP-PAC-EB2",
]
const inputCodes = [
    "4ch Digital",
    "4ch Analog",
    "4ch Latch On",
    "4ch Latch Off",
    "4ch Analog Min",
    "4ch Analog Max",
]
const outputCodes = [
    "4ch Digital",
    "4ch Analog",
    "4ch Latch On",
    "4ch Latch Off",
    "4ch Analog Min",
    "4ch Analog Max",
]

function schema() {
    return {
        $type: "object",
        setts: {
            $type: "object",
            type: {
                value: "SNAP-PAC-EB2",
                label: "Product Family",
                help: "Select product family from list",
                check: function (value, label) {
                    Check.inList(value, label, types)
                },
            },
            host: {
                value: "10.77.0.10",
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
            slave: {
                value: "1",
                label: "Slave Address",
                help: "Non empty integer [0, 255]",
                check: function (value, label) {
                    Check.isInteger(value, label)
                    Check.isGE(value, label, 0)
                    Check.isLE(value, label, 255)
                },
            },
        },
        inputs: {
            $type: "array",
            $value: [
                {
                    code: "4ch Digital",
                    module: "0",
                    number: "1",
                    name: "Emergency",
                },
                {
                    code: "4ch Digital",
                    module: "1",
                    number: "1",
                    name: "Alarm",
                },
                {
                    code: "4ch Analog",
                    module: "2",
                    number: "1",
                    name: "Fuel Display",
                },
                {
                    code: "4ch Analog",
                    module: "4",
                    number: "1",
                    name: "Fuel Level",
                },
                {
                    code: "4ch Latch On",
                    module: "0",
                    number: "1",
                    name: "Emergency Up",
                },
                {
                    code: "4ch Latch Off",
                    module: "0",
                    number: "1",
                    name: "Emergency Down",
                },
                {
                    code: "4ch Analog Min",
                    module: "4",
                    number: "1",
                    name: "Fuel Level Min",
                },
                {
                    code: "4ch Analog Max",
                    module: "4",
                    number: "1",
                    name: "Fuel Level Max",
                },
            ],
            code: {
                value: inputCodes[0],
                header: "Input Type",
                label: (index) => `Input ${index + 1} Type`,
                help: "Select the input type from list",
                check: function (value, label) {
                    Check.inList(value, label, inputCodes)
                },
            },
            module: {
                value: "0",
                header: "Module Number",
                label: (index) => `Input ${index + 1} Module Number`,
                help: "Non empty integer [0, 15]",
                check: function (value, label) {
                    Check.isGE(value, label, 0)
                    Check.isLE(value, label, 15)
                },
            },
            number: {
                value: "1",
                header: "Point Number",
                label: (index) => `Input ${index + 1} Point Number`,
                help: "Non empty integer [1, 4]",
                check: function (value, label) {
                    Check.isGE(value, label, 1)
                    Check.isLE(value, label, 4)
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
        },
        outputs: {
            $type: "array",
            $value: [
                {
                    code: "4ch Digital",
                    module: "1",
                    number: "1",
                    name: "Alarm",
                },
                {
                    code: "4ch Analog",
                    module: "2",
                    number: "1",
                    name: "Fuel Display",
                },
                {
                    code: "4ch Latch On",
                    module: "0",
                    number: "1",
                    name: "Clear Emergency Up",
                },
                {
                    code: "4ch Latch Off",
                    module: "0",
                    number: "1",
                    name: "Clear Emergency Down",
                },
                {
                    code: "4ch Analog Min",
                    module: "4",
                    number: "1",
                    name: "Clear Fuel Level Min",
                },
                {
                    code: "4ch Analog Max",
                    module: "4",
                    number: "1",
                    name: "Clear Fuel Level Max",
                },
            ],
            code: {
                value: outputCodes[0],
                header: "Output Type",
                label: (index) => `Output ${index + 1} Type`,
                help: "Select the output type from list",
                check: function (value, label) {
                    Check.inList(value, label, outputCodes)
                },
            },
            module: {
                value: "0",
                header: "Module Number",
                label: (index) => `Output ${index + 1} Module Number`,
                help: "Non empty integer [0, 15]",
                check: function (value, label) {
                    Check.isGE(value, label, 0)
                    Check.isLE(value, label, 15)
                },
            },
            number: {
                value: "1",
                header: "Point Number",
                label: (index) => `Output ${index + 1} Point Number`,
                help: "Non empty integer [1, 4]",
                check: function (value, label) {
                    Check.isGE(value, label, 1)
                    Check.isLE(value, label, 4)
                },
            },
            name: {
                value: (index) => `Output ${index + 1}`,
                header: "Output Name",
                label: (index) => `Output ${index + 1} Name`,
                help: "Non empty output name",
                check: function (value, label) {
                    Check.notEmpty(value, label)
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
    types,
    inputCodes,
    outputCodes,
    input,
    output,
    schema,
}