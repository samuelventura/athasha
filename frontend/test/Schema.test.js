// @vitest-environment happy-dom

import { expect, test } from 'vitest'
import Check from "../src/common/Check"
import Schema from "../src/common/Schema"
import Clone from '../src/tools/Clone'

const schema = {
    $type: "object",
    fixed: {
        label: "FixedLabel",
        value: "FixedValue",
        help: "FixedHelp",
        check: function (value, label) {
            Check.inList(value, label, ["a", "b"])
        },
    },
    calculated: {
        label: (index, name) => `CalculatedLabel:${index}:${name}`,
        value: (index, name) => `CalculatedValue:${index}:${name}`,
        help: "CalculatedHelp",
        check: function (value, label) {
            Check.inList(value, label, ["a", "b"])
        },
    },
    fixedList: {
        $type: "array",
        $value: [{ id: "FixedValue" }],
        id: {
            label: "ItemId",
            value: "ItemValue",
            help: "ItemHelp",
            check: function (value, label) {
                Check.notEmpty(value, label)
            },
        },
    },
    calculatedList: {
        $type: "array",
        $value: (value) => [value(0), value(1)],
        $check: function (value, label) {
            Check.notEmptyArray(value, label)
        },
        id: {
            label: (index, name) => `ItemId:${index}:${name}`,
            value: (index, name) => `ItemValue:${index}:${name}`,
            help: "ItemHelp",
            check: function (value, label) {
                Check.isNumber(value, label)
            },
        },
    },
}

test('value', () => {
    expect(Schema.value(schema)).toEqual({
        fixed: "FixedValue",
        calculated: "CalculatedValue:undefined:calculated",
        fixedList: [{ id: "FixedValue" }],
        calculatedList: [{ id: "ItemValue:0:id" }, { id: "ItemValue:1:id" }],
    })
})

test('merge from empty', () => {
    expect(Schema.merge(schema, {})).toEqual(Schema.value(schema))
    expect(Schema.errors.get().total).toEqual([
        'FixedLabel is not string: undefined undefined',
        'CalculatedLabel:undefined:calculated is not string: undefined undefined',
        'fixedList is not array: undefined undefined',
        'calculatedList is not array: undefined undefined'
    ])
})

const nested_schema = { ...schema, nested: schema }

const target = {
    fixed: "a",
    calculated: "b",
    fixedList: [{ id: "c" }, { id: "" }],
    calculatedList: [{ id: "1" }, { id: "" }],
}

function check_result(result) {
    expect(result.fixed).toEqual("a")
    expect(result.calculated).toEqual("b")
    expect(result.fixedList).toEqual([{ id: "c" }, { id: "ItemValue" }])
    expect(result.calculatedList).toEqual([{ id: "1" }, { id: "ItemValue:1:id" }])
}

test('merge simple', () => {
    const result = Schema.merge(schema, Clone.deep(target))
    check_result(result)
})

test('merge nested null', () => {
    const result = Schema.merge(nested_schema, Clone.deep(target))
    check_result(result)
    expect(result.nested).toEqual(Schema.value(schema))
})

test('merge nested target', () => {
    const nested_target = { ...target, nested: target }
    const result = Schema.merge(nested_schema, Clone.deep(nested_target))
    check_result(result)
    check_result(result.nested)
})
