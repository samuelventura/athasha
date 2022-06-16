import Check from '../common/Check'

const condTypes = [
    "Disabled",
    "Enabled",
    "Input = Param1",
    "Input > Param1",
    "Input >= Param1",
    "Param1 <= Input <= Param2",
    "Param1 <= Input < Param2",
    "Param1 < Input <= Param2",
    "Param1 < Input < Param2",
]
const textActions = ["Disabled", "Fixed Text", "Format Text"]
const aligns = ["Center", "Left", "Right"]
const fontFamilies = [
    "Roboto Thin",
    "Roboto Light",
    "Roboto Regular",
    "Roboto Medium",
    "Roboto Bold",
    "Roboto Black",
    "Barcode39 Regular",
    "Barcode39 Text",
    "Barcode128 Regular",
    "Barcode128 Text",
    "Oxanium Extra Light",
    "Oxanium Light",
    "Oxanium Regular",
    "Oxanium Medium",
    "Oxanium Semi Bold",
    "Oxanium Bold",
    "Oxanium Extra Bold",
    "Orbitron Regular",
    "Orbitron Medium",
    "Orbitron Semi Bold",
    "Orbitron Bold",
    "Orbitron Extra Bold",
    "Orbitron Black",
]

function cond() {
    return {
        $type: "object",
        type: {
            value: condTypes[0],
            label: "Condition",
            help: "Select the condition type from list",
            check: function (value, label) {
                Check.inList(value, label, condTypes)
            },
        },
        param1: {
            value: "0",
            label: "Param 1",
            help: "Optional number",
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
        param2: {
            value: "0",
            label: "Param 2",
            help: "Optional number",
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
        negate: {
            value: false,
            label: "Negate",
            help: "Reverse the comparison condition",
            check: function (value, label) {
                Check.isBoolean(value, label)
            },
        },
        textAction: {
            value: textActions[0],
            label: "Text Action",
            help: "Select the text action from list",
            check: function (value, label) {
                Check.inList(value, label, textActions)
            },
        },
        textParam: {
            value: "",
            label: "Text Param",
            help: "Optional text param",
            check: function (value, label) {
                Check.isString(value, label)
            },
        },
        backColored: {
            value: false,
            label: "Back Color Enabled",
            help: "Uncheck for transparent back color",
            check: function (value, label) {
                Check.isBoolean(value, label)
            },
        },
        backColor: {
            value: "#ffffff",
            label: "Back Color",
            help: "Non empty column color #RRGGBB",
            check: function (value, label) {
                Check.isColor(value, label)
            },
        },
        textColored: {
            value: false,
            label: "Text Color Enabled",
            help: "Uncheck to leave the default text color",
            check: function (value, label) {
                Check.isBoolean(value, label)
            },
        },
        textColor: {
            value: "#ffffff",
            label: "Text Color",
            help: "Non empty column color #RRGGBB",
            check: function (value, label) {
                Check.isColor(value, label)
            },
        },
        borderColored: {
            value: false,
            label: "Border Color Enabled",
            help: "Uncheck to leave the default border color",
            check: function (value, label) {
                Check.isBoolean(value, label)
            },
        },
        borderColor: {
            value: "#ffffff",
            label: "Border Color",
            help: "Non empty column color #RRGGBB",
            check: function (value, label) {
                Check.isColor(value, label)
            },
        },
    }
}

function schema() {
    return {
        $type: "object",
        text: {
            value: "Label",
            label: "Text",
            help: "Default text to show on label",
            check: function (value, label) {
                Check.isString(value, label)
            },
        },
        align: {
            value: aligns[0],
            label: "Align",
            help: "Label text alignment",
            check: function (value, label) {
                Check.inList(value, label, aligns)
            },
        },
        textColor: {
            value: "#000000",
            label: "Text Color",
            help: "Non empty text color #RRGGBB",
            check: function (value, label) {
                Check.isColor(value, label)
            },
        },
        fontSize: {
            value: "10",
            label: "Font Size",
            help: "Non empty integer > 0",
            check: function (value, label) {
                Check.isInteger(value, label)
                Check.isGE(value, label, 1)
            },
        },
        fontFamily: {
            value: fontFamilies[0],
            label: "Font Family",
            help: "Select family from list",
            check: function (value, label) {
                Check.inList(value, label, fontFamilies)
            },
        },
        backColored: {
            value: false,
            label: "Back Color Enabled",
            help: "Uncheck for transparent back color",
            check: function (value, label) {
                Check.isBoolean(value, label)
            },
        },
        backColor: {
            value: "#ffffff",
            label: "Back Color",
            help: "Non empty back color #RRGGBB",
            check: function (value, label) {
                Check.isColor(value, label)
            },
        },
        borderWidth: {
            value: "0",
            label: "Border Width",
            help: "Non empty integer >= 0",
            check: function (value, label) {
                Check.isInteger(value, label)
                Check.isGE(value, label, 0)
            },
        },
        borderColor: {
            value: "#000000",
            label: "Border Color",
            help: "Non empty border color #RRGGBB",
            check: function (value, label) {
                Check.isColor(value, label)
            },
        },
        borderRadius: {
            value: "0",
            label: "Border Radius",
            help: "Non empty number [0,1]",
            check: function (value, label) {
                Check.isGE(value, label, 0)
                Check.isLE(value, label, 1)
            },
        },
        cond1: cond(),
        cond2: cond(),
        cond3: cond(),
    }
}

const type = "Label"

export default {
    type,
    cond,
    schema,
    aligns,
    condTypes,
    textActions,
    fontFamilies,
}
