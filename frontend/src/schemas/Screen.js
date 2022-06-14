import Check from '../common/Check'
import Label from './Label.js'
import Analog from './Analog.js'
import Image from './Image.js'
import Trend from './Trend.js'
import UUID from '../tools/UUID.js'
import Schema from '../common/Schema'

const controls = {}
controls[Label.type] = Label.schema()
controls[Image.type] = Image.schema()
controls[Analog.type] = Analog.schema()
controls[Trend.type] = Trend.schema()

function id() { return UUID.v4() }

const scales = ["Fit", "Stretch"]
const aligns = ["Center", "Start", "End"]
const clicks = ["Fixed Value", "Value Prompt"]
const types = Object.keys(controls)

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
                        Check.isString(value, label.input)
                    },
                },
                defValue: {
                    value: "0",
                    label: "Input Default",
                    help: "Non empty number",
                    check: function (value, label) {
                        Check.isNumber(value, label)
                    },
                },
                defEnabled: {
                    value: false,
                    label: "Input Default Enabled",
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
                prompt: {
                    value: "Enter Value",
                    label: "Value Prompt",
                    help: "Non empty value prompt",
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
                $type: "object",
                $schema: (control) => controls[control.type],
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
