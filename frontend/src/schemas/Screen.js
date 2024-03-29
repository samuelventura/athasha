import Check from '../common/Check'
import UUID from '../tools/UUID.js'
import Schema from '../common/Schema'
import Control from '../common/Control'

function id() { return UUID.v4() }

const scales = ["Fit", "Stretch"]
const aligns = ["Center", "Start", "End"]
const clicks = ["Fixed Value", "Value Prompt", "Value Selector"]
const types = Control.types

function schema() {
    return {
        $type: "object",
        setts: {
            $type: "object",
            password: {
                value: "",
                label: "Access Password",
                help: "Optional access password",
                check: function (value, label) {
                    Check.isString(value, label)
                },
            },
            period: {
                value: "25",
                label: "Period (ms)",
                help: "Non empty integer update period > 0",
                check: function (value, label) {
                    Check.isInteger(value, label)
                    Check.isGE(value, label, 1)
                },
            },
            scale: {
                value: scales[0],
                label: "Scale",
                help: "Select scale from list",
                check: function (value, label) {
                    Check.inList(value, label, scales)
                },
            },
            align: {
                value: aligns[0],
                label: "Align",
                help: "Select alignment from list",
                check: function (value, label) {
                    Check.inList(value, label, aligns)
                },
            },
            width: {
                value: '640',
                label: "Width",
                help: "Non empty integer > 0",
                check: function (value, label) {
                    Check.isInteger(value, label)
                    Check.isGE(value, label, 1)
                },
            },
            height: {
                value: '480',
                label: "Height",
                help: "Non empty integer > 0",
                check: function (value, label) {
                    Check.isInteger(value, label)
                    Check.isGE(value, label, 1)
                },
            },
            gridX: {
                value: '160',
                label: "Grid X",
                help: "Non empty integer > 0",
                check: function (value, label) {
                    Check.isInteger(value, label)
                    Check.isGE(value, label, 1)
                },
            },
            gridY: {
                value: '120',
                label: "Grid Y",
                help: "Non empty integer > 0",
                check: function (value, label) {
                    Check.isInteger(value, label)
                    Check.isGE(value, label, 1)
                },
            },
            backColor: {
                value: "#ffffff",
                label: "Back Color",
                help: "Non empty backgroung color #RRGGBB",
                check: function (value, label) {
                    Check.isColor(value, label)
                },
            },
            hoverColor: {
                value: "#808080",
                label: "Hover Color",
                help: "Non empty hover color #RRGGBB",
                check: function (value, label) {
                    Check.isColor(value, label)
                },
            },
            background: {
                $type: "object",
                viewBox: {
                    value: "",
                    label: "viewBox",
                    help: "viewBox",
                    check: function (value, label) {
                        Check.isString(value, label)
                    },
                },
                content: {
                    value: "",
                    label: "Content",
                    help: "Content",
                    check: function (value, label) {
                        Check.isString(value, label)
                    },
                },
                filename: {
                    value: "",
                    label: "Filename",
                    help: "Filename",
                    check: function (value, label) {
                        Check.isString(value, label)
                    },
                },
                scale: {
                    value: scales[0],
                    label: "Back Scale",
                    help: "Select scale from list",
                    check: function (value, label) {
                        Check.inList(value, label, scales)
                    },
                },
                align: {
                    value: aligns[0],
                    label: "Back Align",
                    help: "Select alignment from list",
                    check: function (value, label) {
                        Check.inList(value, label, aligns)
                    },
                },
            },
        },
        controls: {
            $type: "array",
            $value: [],
            id: {
                value: () => id(),
                label: "Control ID",
                help: "Control ID",
                header: "Control ID",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            type: {
                value: "",
                label: "Control Type",
                help: "Control Type",
                header: "Control Type",
                check: function (value, label) {
                    Check.inList(value, label, types)
                },
            },
            setts: {
                $type: "object",
                posX: {
                    value: '0',
                    label: "Position X",
                    help: "Non empty integer >= 0",
                    check: function (value, label) {
                        Check.isInteger(value, label)
                        Check.isGE(value, label, 0)
                    },
                },
                posY: {
                    value: '0',
                    label: "Position Y",
                    help: "Non empty integer >= 0",
                    check: function (value, label) {
                        Check.isInteger(value, label)
                        Check.isGE(value, label, 0)
                    },
                },
                width: {
                    value: '1',
                    label: "Width",
                    help: "Non empty integer > 0",
                    check: function (value, label) {
                        Check.isInteger(value, label)
                        Check.isGE(value, label, 1)
                    },
                },
                height: {
                    value: '1',
                    label: "Height",
                    help: "Non empty integer > 0",
                    check: function (value, label) {
                        Check.isInteger(value, label)
                        Check.isGE(value, label, 1)
                    },
                },
                title: {
                    value: "",
                    label: "Tooltip",
                    help: "Optional tooltip",
                    check: function (value, label) {
                        Check.isString(value, label)
                    },
                },
                input: {
                    value: "",
                    label: "Input",
                    help: "Select optional input from list",
                    check: function (value, label) {
                        Check.isString(value, label)
                    },
                },
                istring: {
                    value: false,
                    label: "String Input",
                    help: "Check to show string inputs",
                    check: function (value, label) {
                        Check.isBoolean(value, label)
                    },
                },
                ivalue: {
                    value: "0",
                    label: "Default Value",
                    help: "Non empty number",
                    check: function (value, label) {
                        Check.isNumber(value, label)
                    },
                },
                ivalued: {
                    value: false,
                    label: "Default Value Enabled",
                    help: "Check to enable input default",
                    check: function (value, label) {
                        Check.isBoolean(value, label)
                    },
                },
                isvalue: {
                    value: "",
                    label: "Default String",
                    help: "Non empty string",
                    check: function (value, label) {
                        Check.isString(value, label)
                    },
                },
                isvalued: {
                    value: false,
                    label: "Default String Enabled",
                    help: "Check to enable input default",
                    check: function (value, label) {
                        Check.isBoolean(value, label)
                    },
                },
                output: {
                    value: "",
                    label: "Output",
                    help: "Select optional output from list",
                    check: function (value, label) {
                        Check.isString(value, label)
                    },
                },
                ostring: {
                    value: false,
                    label: "String Output",
                    help: "Check to show string outputs",
                    check: function (value, label) {
                        Check.isBoolean(value, label)
                    },
                },
                click: {
                    value: clicks[0],
                    label: "On Click",
                    help: "Select on click action",
                    check: function (value, label) {
                        Check.inList(value, label, clicks)
                    },
                },
                value: {
                    value: "0",
                    label: "Fixed Value",
                    help: "Non empty fixed value number",
                    check: function (value, label) {
                        Check.isNumber(value, label)
                    },
                },
                svalue: {
                    value: "",
                    label: "Fixed String",
                    help: "Non empty fixed value string",
                    check: function (value, label) {
                        Check.isString(value, label)
                    },
                },
                options: {
                    value: "",
                    label: "Selector Options",
                    help: "Non empty string lines",
                    check: function (value, label) {
                        Check.isString(value, label)
                    },
                },
                prompt: {
                    value: "Enter Value",
                    label: "Prompt Title",
                    help: "Non empty string prompt title",
                    check: function (value, label) {
                        Check.notEmpty(value, label)
                    },
                },
                inputFactor: {
                    value: "1",
                    label: "Input Scale Factor",
                    help: "Non empty number m in f(x)=mx+b",
                    check: function (value, label) {
                        Check.isNumber(value, label)
                    },
                },
                inputOffset: {
                    value: "0",
                    label: "Input Scale Offset",
                    help: "Non empty number b in f(x)=mx+b",
                    check: function (value, label) {
                        Check.isNumber(value, label)
                    },
                },
                outputFactor: {
                    value: "1",
                    label: "Output Scale Factor",
                    help: "Non empty number m in f(x)=mx+b",
                    check: function (value, label) {
                        Check.isNumber(value, label)
                    },
                },
                outputOffset: {
                    value: "0",
                    label: "Output Scale Offset",
                    help: "Non empty number b in f(x)=mx+b",
                    check: function (value, label) {
                        Check.isNumber(value, label)
                    },
                },
                linkBlank: {
                    value: false,
                    label: "Open New Tab",
                    help: "Check to open link in new tab",
                    check: function (value, label) {
                        Check.isBoolean(value, label)
                    },
                },
                linkURL: {
                    value: "",
                    label: "Link URL",
                    help: "Optional URL string",
                    check: function (value, label) {
                        Check.isString(value, label)
                    },
                },
            },
            data: {
                value: {},
                $schema: (control) => Control.get(control.type).schema(),
            },
        },
        inputs: {
            value: {},
            label: "Inputs",
            help: "Inputs",
            check: (value, label) => {
                //FIXME validate input schema
                Check.isObject(value, label)
            },
        },
    }
}

function control(index) {
    const $type = "object"
    const prop = { ...schema().controls, $type }
    return Schema.value(prop, index)
}

export default {
    id,
    scales,
    aligns,
    clicks,
    types,
    schema,
    control,
}
