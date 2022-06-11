// @vitest-environment happy-dom

import { expect, test } from 'vitest'

test('exceptions', () => {
    expect(() => { throw "error xyz" }).toThrow("error xyz")
    expect(() => { throw "error xyz" }).toThrow(/^error xyz$/)
})

test('typeof', () => {
    expect(typeof []).toEqual("object")
    expect(typeof {}).toEqual("object")
    expect(typeof true).toEqual("boolean")
    expect(typeof "").toEqual("string")
    expect(typeof 1).toEqual("number")
})

test('Number', () => {
    expect(Number(1)).toEqual(1)
    expect(Number(1.2)).toEqual(1.2)
    expect(Number("1.2")).toEqual(1.2)
    expect(Number("1mm")).toEqual(NaN)
    expect(Number("false")).toEqual(NaN)
    expect(Number("true")).toEqual(NaN)
    expect(Number("")).toEqual(0)
    expect(Number(null)).toEqual(0)
    expect(Number()).toEqual(0)
    expect(Number([])).toEqual(0)
    expect(Number(undefined)).toEqual(NaN)
    expect(Number({})).toEqual(NaN)
    expect(Number(false)).toEqual(0)
    expect(Number(true)).toEqual(1)
})

test('Number.isInteger', () => {
    expect(Number.isInteger(1)).toEqual(true)
    expect(Number.isInteger(1.2)).toEqual(false)
})

test('isFinite', () => {
    expect(isFinite(1)).toEqual(true)
    expect(isFinite(1.2)).toEqual(true)
    expect(isFinite("1.2")).toEqual(true)
    expect(isFinite("")).toEqual(true)
    expect(isFinite(null)).toEqual(true)
    expect(isFinite([])).toEqual(true)
    expect(isFinite()).toEqual(false)
    expect(isFinite(undefined)).toEqual(false)
    expect(isFinite({})).toEqual(false)
    expect(isFinite(false)).toEqual(true)
    expect(isFinite(true)).toEqual(true)
})

test('parseFloat', () => {
    expect(parseFloat(1)).toEqual(1)
    expect(parseFloat(1.2)).toEqual(1.2)
    expect(parseFloat("1.2")).toEqual(1.2)
    expect(parseFloat("1.2mm")).toEqual(1.2)
    expect(parseFloat("mm")).toEqual(NaN)
    expect(parseFloat("")).toEqual(NaN)
    expect(parseFloat(false)).toEqual(NaN)
    expect(parseFloat(true)).toEqual(NaN)
})

test('parseInt', () => {
    expect(parseInt(1)).toEqual(1)
    expect(parseInt(1.2)).toEqual(1)
    expect(parseInt("1.2")).toEqual(1)
    expect(parseInt("1.2mm")).toEqual(1)
    expect(parseInt("mm")).toEqual(NaN)
    expect(parseInt("")).toEqual(NaN)
    expect(parseInt(false)).toEqual(NaN)
    expect(parseInt(true)).toEqual(NaN)
})

test('JSON.stringify', () => {
    expect(JSON.stringify()).toEqual(undefined)
    expect(JSON.stringify(undefined)).toEqual(undefined)
    expect(JSON.stringify(null)).toEqual('null')
    expect(JSON.stringify(1)).toEqual('1')
    expect(JSON.stringify(1.2)).toEqual('1.2')
    expect(JSON.stringify(true)).toEqual('true')
    expect(JSON.stringify("abc")).toEqual('"abc"')
    expect(JSON.stringify([])).toEqual('[]')
    expect(JSON.stringify([null])).toEqual('[null]')
    expect(JSON.stringify([null, undefined])).toEqual('[null,null]')
    expect(JSON.stringify({})).toEqual('{}')
    expect(JSON.stringify({ a: null })).toEqual('{"a":null}')
    expect(JSON.stringify({ a: undefined })).toEqual('{}')
    expect(JSON.stringify(new Date("2022-06-10T09:10:37.383Z"))).toEqual('"2022-06-10T09:10:37.383Z"')
})

test('Object.keys', () => {
    expect(Object.keys({})).toEqual([])
    expect(Object.keys([])).toEqual([])
    //expect(Object.keys(null)).toEqual([]) //throws
    //expect(Object.keys(undefined)).toEqual([]) //throws
    //expect(Object.keys()).toEqual([]) //throws
})
