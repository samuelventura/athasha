import Check from '../common/Check'

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
            code: {
                value: "",
                label: "Code",
                help: "Code",
                check: function (value, label) {
                    Check.isString(value, label)
                }
            },
        },
    }
}

export default {
    schema,
}
