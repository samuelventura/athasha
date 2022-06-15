// @vitest-environment happy-dom

import { expect, test } from 'vitest'
import Check from "../src/common/Check"

test('checkLabel', () => {
    expect(() => Check.$checkLabel()).toThrow(/^ALERT: Label is undefined/)
    expect(() => Check.$checkLabel(null)).toThrow(/^ALERT: Label is null/)
    expect(() => Check.$checkLabel(" ")).toThrow(/^ALERT: Label is empty/)
})

//checkbox inputs value are booleans
//all other inputs value are strings

//boolean expected
test('isBoolean', () => {
    expect(() => Check.isBoolean(true, "LABEL")).not.toThrow()
    expect(() => Check.isBoolean("true", "LABEL")).toThrow(/^LABEL is not boolean: string true$/)
})

//string expected from here
test('inList', () => {
    expect(() => Check.inList("1", "LABEL", ["1"])).not.toThrow()
    expect(() => Check.inList("1", "LABEL", ["2", "3"])).toThrow(/^LABEL is not in \[2,3]$/)
    expect(() => Check.inList(2, "LABEL", ["2", "3"])).toThrow(/^LABEL is not string: number 2$/)
})

test('isArray', () => {
    expect(() => Check.isArray([], "LABEL")).not.toThrow()
    expect(() => Check.isArray(1, "LABEL")).toThrow(/^LABEL is not array: number 1$/)
})

test('notEmptyArray', () => {
    expect(() => Check.notEmptyArray([1], "LABEL")).not.toThrow()
    expect(() => Check.notEmptyArray(1, "LABEL")).toThrow(/^LABEL is not array: number 1$/)
    expect(() => Check.notEmptyArray([], "LABEL")).toThrow(/^LABEL has zero length$/)
})

test('isString', () => {
    expect(() => Check.isString("", "LABEL")).not.toThrow()
    expect(() => Check.isString(1, "LABEL")).toThrow(/^LABEL is not string: number 1$/)
})

test('notEmpty', () => {
    expect(() => Check.notEmpty("a", "LABEL")).not.toThrow()
    expect(() => Check.notEmpty(" ", "LABEL")).toThrow(/^LABEL is empty$/)
})

test('isInteger', () => {
    expect(() => Check.isInteger("1", "LABEL")).not.toThrow()
    expect(() => Check.isInteger(" ", "LABEL")).toThrow(/^LABEL is empty$/)
    expect(() => Check.isInteger(1, "LABEL")).toThrow(/^LABEL is not string: number 1$/)
    expect(() => Check.isInteger("1mm", "LABEL")).toThrow(/^LABEL is not integer: 1mm$/)
})

test('isNumber', () => {
    expect(() => Check.isNumber("1.2", "LABEL")).not.toThrow()
    expect(() => Check.isNumber(" ", "LABEL")).toThrow(/^LABEL is empty$/)
    expect(() => Check.isNumber(1, "LABEL")).toThrow(/^LABEL is not string: number 1$/)
    expect(() => Check.isNumber("1mm", "LABEL")).toThrow(/^LABEL is not number: 1mm$/)
})

test('isGT', () => {
    expect(() => Check.isGT("1.2", "LABEL", 1)).not.toThrow()
    expect(() => Check.isGT(" ", "LABEL")).toThrow(/^LABEL is empty$/)
    expect(() => Check.isGT(1, "LABEL")).toThrow(/^LABEL is not string: number 1$/)
    expect(() => Check.isGT("1mm", "LABEL")).toThrow(/^LABEL is not number: 1mm$/)
    expect(() => Check.isGT("1.2", "LABEL", 1.2)).toThrow(/^LABEL is not > 1.2: 1.2$/)
    expect(() => Check.isGT("1.2", "LABEL", 2)).toThrow(/^LABEL is not > 2: 1.2$/)
})

test('isLT', () => {
    expect(() => Check.isLT("1.2", "LABEL", 2)).not.toThrow()
    expect(() => Check.isLT(" ", "LABEL")).toThrow(/^LABEL is empty$/)
    expect(() => Check.isLT(1, "LABEL")).toThrow(/^LABEL is not string: number 1$/)
    expect(() => Check.isLT("1mm", "LABEL")).toThrow(/^LABEL is not number: 1mm$/)
    expect(() => Check.isLT("1.2", "LABEL", 1.2)).toThrow(/^LABEL is not < 1.2: 1.2$/)
    expect(() => Check.isLT("1.2", "LABEL", 1)).toThrow(/^LABEL is not < 1: 1.2$/)
})

test('isGE', () => {
    expect(() => Check.isGE("1.2", "LABEL", 1)).not.toThrow()
    expect(() => Check.isGE("1.2", "LABEL", 1.2)).not.toThrow()
    expect(() => Check.isGE(" ", "LABEL")).toThrow(/^LABEL is empty$/)
    expect(() => Check.isGE(1, "LABEL")).toThrow(/^LABEL is not string: number 1$/)
    expect(() => Check.isGE("1mm", "LABEL")).toThrow(/^LABEL is not number: 1mm$/)
    expect(() => Check.isGE("1.2", "LABEL", 2)).toThrow(/^LABEL is not >= 2: 1.2$/)
})

test('isLE', () => {
    expect(() => Check.isLE("1.2", "LABEL", 2)).not.toThrow()
    expect(() => Check.isLE("1.2", "LABEL", 1.2)).not.toThrow()
    expect(() => Check.isLE(" ", "LABEL")).toThrow(/^LABEL is empty$/)
    expect(() => Check.isLE(1, "LABEL")).toThrow(/^LABEL is not string: number 1$/)
    expect(() => Check.isLE("1mm", "LABEL")).toThrow(/^LABEL is not number: 1mm$/)
    expect(() => Check.isLE("1.2", "LABEL", 1)).toThrow(/^LABEL is not <= 1: 1.2$/)
})

test('notZero', () => {
    expect(() => Check.notZero("1", "LABEL")).not.toThrow()
    expect(() => Check.notZero(" ", "LABEL")).toThrow(/^LABEL is empty$/)
    expect(() => Check.notZero(1, "LABEL")).toThrow(/^LABEL is not string: number 1$/)
    expect(() => Check.notZero("1mm", "LABEL")).toThrow(/^LABEL is not number: 1mm$/)
    expect(() => Check.notZero("0", "LABEL")).toThrow(/^LABEL cannot be 0: 0$/)
    expect(() => Check.notZero("0.0", "LABEL")).toThrow(/^LABEL cannot be 0: 0.0$/)
})

test('isColor', () => {
    expect(() => Check.isColor("#F0F0F0", "LABEL")).not.toThrow()
    expect(() => Check.isColor(" ", "LABEL")).toThrow(/^LABEL is empty$/)
    expect(() => Check.isColor(1, "LABEL")).toThrow(/^LABEL is not string: number 1$/)
    expect(() => Check.isColor("1", "LABEL")).toThrow(/^LABEL is not a color #RRGGBB: 1$/)
})

test('hasProp', () => {
    expect(() => Check.hasProp({ a: 1 }, "LABEL", "a")).not.toThrow()
    expect(() => Check.hasProp([], "LABEL", "a")).toThrow(/^LABEL is not object: array$/)
    expect(() => Check.hasProp(1, "LABEL", "a")).toThrow(/^LABEL is not object: number$/)
    expect(() => Check.hasProp({}, "LABEL", "a")).toThrow(/^LABEL has no property a$/)
    expect(() => Check.hasProp({ a: null }, "LABEL", "a")).toThrow(/^LABEL has no property a: null$/)
    expect(() => Check.hasProp({ a: undefined }, "LABEL", "a")).toThrow(/^LABEL has no property a: undefined$/)
})
