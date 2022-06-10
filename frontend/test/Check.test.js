// @vitest-environment happy-dom

import { expect, test } from 'vitest'
import Check from "../src/common/Check"

test('checkLabel', () => {
    expect(() => Check.$checkLabel()).toThrowError(/^ALERT: Label is undefined$/)
    expect(() => Check.$checkLabel(null)).toThrowError(/^ALERT: Label is null$/)
    expect(() => Check.$checkLabel(" ")).toThrowError(/^ALERT: Label is empty$/)
})

//checkbox inputs value are booleans
//all other inputs value are strings

//boolean expected
test('isBoolean', () => {
    expect(() => Check.isBoolean(true, "LABEL")).not.toThrowError()
    expect(() => Check.isBoolean("true", "LABEL")).toThrowError(/^LABEL is not boolean: string true$/)
})

//string expected from here
test('inList', () => {
    expect(() => Check.inList("1", "LABEL", ["1"])).not.toThrowError()
    expect(() => Check.inList("1", "LABEL", ["2", "3"])).toThrowError(/^LABEL is not in \[2,3]$/)
    expect(() => Check.inList(2, "LABEL", ["2", "3"])).toThrowError(/^LABEL is not string: number 2$/)
})

test('isArray', () => {
    expect(() => Check.isArray([], "LABEL")).not.toThrowError()
    expect(() => Check.isArray(1, "LABEL")).toThrowError(/^LABEL is not array: number 1$/)
})

test('notEmptyArray', () => {
    expect(() => Check.notEmptyArray([1], "LABEL")).not.toThrowError()
    expect(() => Check.notEmptyArray(1, "LABEL")).toThrowError(/^LABEL is not array: number 1$/)
    expect(() => Check.notEmptyArray([], "LABEL")).toThrowError(/^LABEL has zero length$/)
})

test('isString', () => {
    expect(() => Check.isString("", "LABEL")).not.toThrowError()
    expect(() => Check.isString(1, "LABEL")).toThrowError(/^LABEL is not string: number 1$/)
})

test('notEmpty', () => {
    expect(() => Check.notEmpty("a", "LABEL")).not.toThrowError()
    expect(() => Check.notEmpty(" ", "LABEL")).toThrowError(/^LABEL is empty$/)
})

test('isInteger', () => {
    expect(() => Check.isInteger("1", "LABEL")).not.toThrowError()
    expect(() => Check.isInteger(" ", "LABEL")).toThrowError(/^LABEL is empty$/)
    expect(() => Check.isInteger(1, "LABEL")).toThrowError(/^LABEL is not string: number 1$/)
    expect(() => Check.isInteger("1mm", "LABEL")).toThrowError(/^LABEL is not integer: 1mm$/)
})

test('isNumber', () => {
    expect(() => Check.isNumber("1.2", "LABEL")).not.toThrowError()
    expect(() => Check.isNumber(" ", "LABEL")).toThrowError(/^LABEL is empty$/)
    expect(() => Check.isNumber(1, "LABEL")).toThrowError(/^LABEL is not string: number 1$/)
    expect(() => Check.isNumber("1mm", "LABEL")).toThrowError(/^LABEL is not number: 1mm$/)
})

test('isGT', () => {
    expect(() => Check.isGT("1.2", "LABEL", 1)).not.toThrowError()
    expect(() => Check.isGT(" ", "LABEL")).toThrowError(/^LABEL is empty$/)
    expect(() => Check.isGT(1, "LABEL")).toThrowError(/^LABEL is not string: number 1$/)
    expect(() => Check.isGT("1mm", "LABEL")).toThrowError(/^LABEL is not number: 1mm$/)
    expect(() => Check.isGT("1.2", "LABEL", 1.2)).toThrowError(/^LABEL is not > 1.2: 1.2$/)
    expect(() => Check.isGT("1.2", "LABEL", 2)).toThrowError(/^LABEL is not > 2: 1.2$/)
})

test('isLT', () => {
    expect(() => Check.isLT("1.2", "LABEL", 2)).not.toThrowError()
    expect(() => Check.isLT(" ", "LABEL")).toThrowError(/^LABEL is empty$/)
    expect(() => Check.isLT(1, "LABEL")).toThrowError(/^LABEL is not string: number 1$/)
    expect(() => Check.isLT("1mm", "LABEL")).toThrowError(/^LABEL is not number: 1mm$/)
    expect(() => Check.isLT("1.2", "LABEL", 1.2)).toThrowError(/^LABEL is not < 1.2: 1.2$/)
    expect(() => Check.isLT("1.2", "LABEL", 1)).toThrowError(/^LABEL is not < 1: 1.2$/)
})

test('isGE', () => {
    expect(() => Check.isGE("1.2", "LABEL", 1)).not.toThrowError()
    expect(() => Check.isGE("1.2", "LABEL", 1.2)).not.toThrowError()
    expect(() => Check.isGE(" ", "LABEL")).toThrowError(/^LABEL is empty$/)
    expect(() => Check.isGE(1, "LABEL")).toThrowError(/^LABEL is not string: number 1$/)
    expect(() => Check.isGE("1mm", "LABEL")).toThrowError(/^LABEL is not number: 1mm$/)
    expect(() => Check.isGE("1.2", "LABEL", 2)).toThrowError(/^LABEL is not >= 2: 1.2$/)
})

test('isLE', () => {
    expect(() => Check.isLE("1.2", "LABEL", 2)).not.toThrowError()
    expect(() => Check.isLE("1.2", "LABEL", 1.2)).not.toThrowError()
    expect(() => Check.isLE(" ", "LABEL")).toThrowError(/^LABEL is empty$/)
    expect(() => Check.isLE(1, "LABEL")).toThrowError(/^LABEL is not string: number 1$/)
    expect(() => Check.isLE("1mm", "LABEL")).toThrowError(/^LABEL is not number: 1mm$/)
    expect(() => Check.isLE("1.2", "LABEL", 1)).toThrowError(/^LABEL is not <= 1: 1.2$/)
})

test('notZero', () => {
    expect(() => Check.notZero("1", "LABEL")).not.toThrowError()
    expect(() => Check.notZero(" ", "LABEL")).toThrowError(/^LABEL is empty$/)
    expect(() => Check.notZero(1, "LABEL")).toThrowError(/^LABEL is not string: number 1$/)
    expect(() => Check.notZero("1mm", "LABEL")).toThrowError(/^LABEL is not number: 1mm$/)
    expect(() => Check.notZero("0", "LABEL")).toThrowError(/^LABEL cannot be 0: 0$/)
    expect(() => Check.notZero("0.0", "LABEL")).toThrowError(/^LABEL cannot be 0: 0.0$/)
})

test('isColor', () => {
    expect(() => Check.isColor("#F0F0F0", "LABEL")).not.toThrowError()
    expect(() => Check.isColor(" ", "LABEL")).toThrowError(/^LABEL is empty$/)
    expect(() => Check.isColor(1, "LABEL")).toThrowError(/^LABEL is not string: number 1$/)
    expect(() => Check.isColor("1", "LABEL")).toThrowError(/^LABEL is not a color #RRGGBB: 1$/)
})

test('hasProp', () => {
    expect(() => Check.hasProp({ a: 1 }, "LABEL", "a")).not.toThrowError()
    expect(() => Check.hasProp([], "LABEL", "a")).toThrowError(/^LABEL is not object: array$/)
    expect(() => Check.hasProp(1, "LABEL", "a")).toThrowError(/^LABEL is not object: number$/)
    expect(() => Check.hasProp({}, "LABEL", "a")).toThrowError(/^LABEL has no property a$/)
    expect(() => Check.hasProp({ a: null }, "LABEL", "a")).toThrowError(/^LABEL has no property a: null$/)
    expect(() => Check.hasProp({ a: undefined }, "LABEL", "a")).toThrowError(/^LABEL has no property a: undefined$/)
})
