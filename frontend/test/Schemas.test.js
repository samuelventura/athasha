// @vitest-environment happy-dom

import { expect, test } from 'vitest'
import Schema from "../src/common/Schema"
import Datafetch from '../src/schemas/Datafetch.js'
import Datalink from '../src/schemas/Datalink.js'
import Datalog from '../src/schemas/Datalog.js'
import Dataplot from '../src/schemas/Dataplot.js'
import Laurel from '../src/schemas/Laurel.js'
import Modbus from '../src/schemas/Modbus.js'
import Opto22 from '../src/schemas/Opto22.js'
import Screen from '../src/schemas/Screen.js'
import Analog from '../src/schemas/Analog.js'
import Image from '../src/schemas/Image.js'
import Trend from '../src/schemas/Trend.js'

test('Datafetch merge vs initial', () => {
    const merged = Schema.merge(Datafetch.schema(), {})
    const initial = Schema.value(Datafetch.schema())
    expect(merged).toEqual(initial)
})

test('Datalink merge vs initial', () => {
    const merged = Schema.merge(Datalink.schema(), {})
    const initial = Schema.value(Datalink.schema())
    expect(merged).toEqual(initial)
})

test('Datalog merge vs initial', () => {
    const merged = Schema.merge(Datalog.schema(), {})
    const initial = Schema.value(Datalog.schema())
    expect(merged).toEqual(initial)
})

test('Dataplot merge vs initial', () => {
    const merged = Schema.merge(Dataplot.schema(), {})
    const initial = Schema.value(Dataplot.schema())
    expect(merged).toEqual(initial)
})

test('Laurel merge vs initial', () => {
    const merged = Schema.merge(Laurel.schema(), {})
    const initial = Schema.value(Laurel.schema())
    expect(merged).toEqual(initial)
})

test('Modbus merge vs initial', () => {
    const merged = Schema.merge(Modbus.schema(), {})
    const initial = Schema.value(Modbus.schema())
    expect(merged).toEqual(initial)
})

test('Opto22 merge vs initial', () => {
    const merged = Schema.merge(Opto22.schema(), {})
    const initial = Schema.value(Opto22.schema())
    expect(merged).toEqual(initial)
})

test('Screen merge vs initial', () => {
    const merged = Schema.merge(Screen.schema(), {})
    const initial = Schema.value(Screen.schema())
    expect(merged).toEqual(initial)
})

test('Analog merge vs initial', () => {
    const merged = Schema.merge(Analog.schema(), {})
    const initial = Schema.value(Analog.schema())
    expect(merged).toEqual(initial)
})

test('Analog merge vs initial', () => {
    const merged = Schema.merge(Image.schema(), {})
    const initial = Schema.value(Image.schema())
    expect(merged).toEqual(initial)
})

test('Trend merge vs initial', () => {
    const merged = Schema.merge(Trend.schema(), {})
    const initial = Schema.value(Trend.schema())
    expect(merged).toEqual(initial)
})
