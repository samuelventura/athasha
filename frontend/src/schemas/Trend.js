import Check from '../common/Check'

const priority = "\nPriority: Normal > Warning > Critical/Input"

function schema() {
    return {
        $type: "object",
        samplePeriod: {
            value: "1",
            label: "Sample Period (s)",
            help: "Non empty integer > 0",
            check: function (value, label) {
                Check.isInteger(value, label)
                Check.isGT(value, label, 0)
            },
        },
        sampleLength: {
            value: "60",
            label: "Sample Length (s)",
            help: "Non empty integer > 0",
            check: function (value, label) {
                Check.isInteger(value, label)
                Check.isGT(value, label, 0)
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
        normalColored: {
            value: true,
            label: "Normal Color Enabled",
            help: "Uncheck for transparent normal color",
            check: function (value, label) {
                Check.isBoolean(value, label)
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
        warningColored: {
            value: true,
            label: "Warning Color Enabled",
            help: "Uncheck for transparent warning color",
            check: function (value, label) {
                Check.isBoolean(value, label)
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
        criticalColored: {
            value: true,
            label: "Critical Color Enabled",
            help: "Uncheck for transparent critical color",
            check: function (value, label) {
                Check.isBoolean(value, label)
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
        lineWidth: {
            value: "1",
            label: "Line Width",
            help: "Non empty integer >= 0",
            check: function (value, label) {
                Check.isInteger(value, label)
                Check.isGE(value, label, 1)
            },
        },
        lineColored: {
            value: true,
            label: "Line Color Enabled",
            help: "Uncheck for transparent line color",
            check: function (value, label) {
                Check.isBoolean(value, label)
            },
        },
        lineColor: {
            value: "#f0f0f0",
            label: "Line Color",
            help: "Non empty line color #RRGGBB",
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
            value: true,
            label: "Grid Color Enabled",
            help: "Uncheck for transparent grid color",
            check: function (value, label) {
                Check.isBoolean(value, label)
            },
        },
        gridColor: {
            value: "#f0f0f0",
            label: "Grid Color",
            help: "Non empty grid color #RRGGBB",
            check: function (value, label) {
                Check.isColor(value, label)
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
    }
}

const type = "Trend"

export default {
    type,
    schema,
}
