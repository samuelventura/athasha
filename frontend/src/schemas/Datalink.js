import Check from '../common/Check'
import Schema from '../common/Schema'

function schema() {
    return {
        $type: "object",
        setts: {
            $type: "object",
            period: {
                value: "25",
                label: "Period (ms)",
                help: "Non empty integer period > 0",
                check: function (value, label) {
                    Check.isGE(value, label, 1)
                }
            },
        },
        links: {
            $type: "array",
            $value: (value) => [value(0)],
            input: {
                value: "",
                header: "Input Name",
                label: (index) => `Input ${index + 1}`,
                help: "Select the input name from the list",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            output: {
                value: "",
                header: "Output Name",
                label: (index) => `Output ${index + 1}`,
                help: "Select the output name from the list",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            factor: {
                value: "1",
                header: "Value Factor",
                label: (index) => `Link ${index + 1} Factor`,
                help: "Non zero number m in f(x)=m*x+b",
                check: function (value, label) {
                    Check.notZero(value, label)
                },
            },
            offset: {
                value: "0",
                header: "Value Offset",
                label: (index) => `Link ${index + 1} Offset`,
                help: "Non empty number b in f(x)=m*x+b",
                check: function (value, label) {
                    Check.isNumber(value, label)
                },
            },
        },
    }
}

function link(index) {
    const $type = "object"
    const prop = { ...schema().links, $type }
    return Schema.value(prop, index)
}

export default {
    schema,
    link,
}
