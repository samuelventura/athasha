import Check from '../common/Check'
import Schema from '../common/Schema'

function schema() {
    return {
        $type: "object",
        setts: {
            $type: "object",
            name: {
                value: "Preset",
                label: "Preset Name",
                help: "Non empty string",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                }
            },
        },
        params: {
            $type: "array",
            //initial here requires initial params for each program
            //or react will complain at editor launch
            $value: [],
            $check: function (value, label) {
                Check.isArray(value, label)
                //will clear array when duplicates found
                //const outputs = value.map(v => v.output)
                //Check.hasDuplicates(outputs, label)
            },
            output: {
                value: "",
                header: "Param Output",
                label: (index) => `Param Output ${index + 1}`,
                help: "Select the output name from the list",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            name: {
                value: "",
                header: "Param Name",
                label: (index) => `Param Name ${index + 1}`,
                help: "Non empty string",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                }
            },
            desc: {
                value: "",
                header: "Param Description",
                label: (index) => `Param ${index + 1} Description`,
                help: "Optional description string",
                check: function (value, label) {
                    Check.isString(value, label)
                },
            },
        },
        programs: {
            $type: "array",
            $value: (value) => [value(0)],
            $check: function (value, label) {
                Check.isArray(value, label)
                //will clear array when duplicates found
                //const names = value.map(v => v.name)
                //Check.hasDuplicates(names, label)
            },
            name: {
                value: (index) => `${index + 1}`,
                header: "Program Name",
                label: (index) => `Program Name ${index + 1}`,
                help: "Non empty string",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                }
            },
            desc: {
                value: (index) => `Program ${index + 1}`,
                header: "Program Description",
                label: (index) => `Program ${index + 1} Description`,
                help: "Optional description string",
                check: function (value, label) {
                    Check.isString(value, label)
                },
            },
            params: {
                $type: "array",
                $value: [],
                output: {
                    value: "",
                    header: "Param Output",
                    label: "Param Output",
                    help: "Param Output",
                    check: function (value, label) {
                        Check.notEmpty(value, label)
                    },
                },
                value: {
                    value: "0",
                    header: "Param Value",
                    label: "Param Value",
                    help: "Param Value",
                    check: function (value, label) {
                        Check.isNumber(value, label)
                    },
                },
            },
        },
        tags: {
            $type: "array",
            $value: [],
            name: {
                value: "",
                header: "Tag Name",
                label: (index) => `Tag Name ${index + 1}`,
                help: "Non empty fixed string or glob pattern\n? = single char\n* = multiple chars",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            program: {
                value: "",
                header: "Tag Program",
                label: (index) => `Tag Program ${index + 1}`,
                help: "Select program from list",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            desc: {
                value: "",
                header: "Tag Description",
                label: (index) => `Tag ${index + 1} Description`,
                help: "Optional description string",
                check: function (value, label) {
                    Check.isString(value, label)
                },
            },
        },
    }
}

function param(index) {
    const $type = "object"
    const prop = { ...schema().params, $type }
    return Schema.value(prop, index)
}

function program(index) {
    const $type = "object"
    const prop = { ...schema().programs, $type }
    return Schema.value(prop, index)
}

function tag(index) {
    const $type = "object"
    const prop = { ...schema().tags, $type }
    return Schema.value(prop, index)
}

function programParam(index) {
    const $type = "object"
    const prop = { ...schema().programs.params, $type }
    return Schema.value(prop, index)
}

export default {
    schema,
    param,
    program,
    programParam,
    tag,
}
