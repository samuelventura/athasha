// @vitest-environment happy-dom

import { expect, test } from 'vitest'
import Schema from "../src/common/Schema"
import Datafetch from '../src/editors/Datafetch.js'
import Datalink from '../src/editors/Datalink.js'
import Datalog from '../src/editors/Datalog.js'
import Dataplot from '../src/editors/Dataplot.js'
import Laurel from '../src/editors/Laurel.js'
import Modbus from '../src/editors/Modbus.js'

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
