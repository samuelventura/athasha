import Check from '../common/Check'

const orientations = ["Circular", "Vertical", "Horizontal"]
const styles = ["Custom", "Standard"]

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
        style: {
            value: styles[0],
            label: "Look & Feel",
            help: "Alert handling style",
            check: function (value, label) {
                Check.inList(value, label, styles)
            },
        },
        barZero: {
            value: "0",
            label: "Bar Zero",
            help: "Non empty number [-180, 180]",
            check: function (value, label) {
                Check.isGE(value, label, -180)
                Check.isLE(value, label, +180)
            },
        },
        barSpan: {
            value: "180",
            label: "Bar Span",
            help: "Non empty number (0, 360]",
            check: function (value, label) {
                Check.isGT(value, label, 0)
                Check.isLE(value, label, 360)
            },
        },
        barWidth: {
            value: "10",
            label: "Bar Width",
            help: "Non empty number > 0",
            check: function (value, label) {
                Check.isGT(value, label, 0)
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
            value: false,
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
            help: "Non empty number (same as critical)",
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
        inputMax: {
            value: "10000",
            label: "Input Range Maximum",
            help: "Non empty number (same as critical)",
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
        normalMin: {
            value: "4000",
            label: "Normal Range Minimum",
            help: "Non empty number",
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
        normalMax: {
            value: "6000",
            label: "Normal Range Maximum",
            help: "Non empty number",
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
        warningMin: {
            value: "2000",
            label: "Warning Range Minimum",
            help: "Non empty number",
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
        warningMax: {
            value: "8000",
            label: "Warning Range Maximum",
            help: "Non empty number",
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
    }
}

const type = "Analog"

export default {
    type,
    schema,
    orientations,
    styles,
}
