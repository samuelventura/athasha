import Check from '../common/Check'

const scales = ["Fit", "Stretch"]
const aligns = ["Center", "Start", "End"]

function schema() {
    return {
        $type: "object",
        viewBox: {
            value: "",
            label: "viewBox",
            help: "viewBox",
            check: function (value, label) {
                Check.notEmpty(value, label)
            },
        },
        content: {
            value: "",
            label: "Content",
            help: "Content",
            check: function (value, label) {
                Check.notEmpty(value, label)
            },
        },
        filename: {
            value: "",
            label: "Filename",
            help: "Filename",
            check: function (value, label) {
                Check.notEmpty(value, label)
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
    }
}

const type = "Image"

export default {
    type,
    schema,
    aligns,
    scales,
}
