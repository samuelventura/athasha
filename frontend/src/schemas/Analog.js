import Check from '../common/Check'

const orientations = ["Circular", "Vertical", "Horizontal"]
const priority = "\nPriority: Normal > Warning > Critical/Input"

function schema() {
    return {
        $type: "object",
        orientation: {
            value: orientations[0],
            label: "Orientation",
            help: "Bar orientation",
            check: function (value, label) {
                Check.inList(value, label, orientations)
            },
        },
        arcZero: {
            value: "-45",
            label: "Arc Zero",
            help: "Non empty degrees [-180, 180]",
            check: function (value, label) {
                Check.isGE(value, label, -180)
                Check.isLE(value, label, +180)
            },
        },
        arcSpan: {
            value: "270",
            label: "Arc Span",
            help: "Non empty degrees (0, 360]",
            check: function (value, label) {
                Check.isGT(value, label, 0)
                Check.isLE(value, label, 360)
            },
        },
        arcWidth: {
            value: "0.2",
            label: "Arc Width",
            help: "Non empty number (0, 1]",
            check: function (value, label) {
                Check.isGT(value, label, 0)
                Check.isLE(value, label, 1)
            },
        },
        barRatio: {
            value: "1",
            label: "Bar Ratio",
            help: "Non empty number (0, 1]",
            check: function (value, label) {
                Check.isGT(value, label, 0)
                Check.isLE(value, label, 1)
            },
        },
        barOpacity: {
            value: "0.5",
            label: "Bar Opacity",
            help: "Non empty number (0, 1]",
            check: function (value, label) {
                Check.isGT(value, label, 0)
                Check.isLE(value, label, 1)
            },
        },
        barGrayscale: {
            value: "0",
            label: "Bar Grayscale",
            help: "Non empty number [0, 1]",
            check: function (value, label) {
                Check.isGE(value, label, 0)
                Check.isLE(value, label, 1)
            },
        },
        barColored: {
            value: true,
            label: "Bar Color Enabled",
            help: "Uncheck for transparent background",
            check: function (value, label) {
                Check.isBoolean(value, label)
            },
        },
        barColor: {
            value: "#c0c0c0",
            label: "Bar Color",
            help: "Non empty background color #RRGGBB",
            check: function (value, label) {
                Check.isColor(value, label)
            },
        },
        inputMin: {
            value: "0",
            label: "Input Range Minimum",
            help: "Non empty number (same as critical)" + priority,
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
        inputMax: {
            value: "10000",
            label: "Input Range Maximum",
            help: "Non empty number (same as critical)" + priority,
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
        normalMin: {
            value: "4000",
            label: "Normal Range Minimum",
            help: "Non empty number" + priority,
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
        normalMax: {
            value: "6000",
            label: "Normal Range Maximum",
            help: "Non empty number" + priority,
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
        warningMin: {
            value: "2000",
            label: "Warning Range Minimum",
            help: "Non empty number" + priority,
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
        warningMax: {
            value: "8000",
            label: "Warning Range Maximum",
            help: "Non empty number" + priority,
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
        normalColor: {
            value: "#88B407",
            label: "Normal Color",
            help: "Non empty normal color #RRGGBB",
            check: function (value, label) {
                Check.isColor(value, label)
            },
        },
        warningColor: {
            value: "#FF9436",
            label: "Warning Color",
            help: "Non empty warning color #RRGGBB",
            check: function (value, label) {
                Check.isColor(value, label)
            },
        },
        criticalColor: {
            value: "#FC342A",
            label: "Critical Color",
            help: "Non empty critical color #RRGGBB",
            check: function (value, label) {
                Check.isColor(value, label)
            },
        },
        gridWidth: {
            value: "1",
            label: "Grid Width",
            help: "Non empty integer >= 0",
            check: function (value, label) {
                Check.isInteger(value, label)
                Check.isGE(value, label, 1)
            },
        },
        gridColored: {
            value: false,
            label: "Grid Color Enabled",
            help: "Uncheck for transparent grid color",
            check: function (value, label) {
                Check.isBoolean(value, label)
            },
        },
        gridColor: {
            value: "#cfcfcf",
            label: "Grid Color",
            help: "Non empty grid color #RRGGBB",
            check: function (value, label) {
                Check.isColor(value, label)
            },
        },
    }
}

const type = "Analog"

export default {
    type,
    schema,
    orientations,
}
