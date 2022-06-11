import Log from '../tools/Log'
import Clone from '../tools/Clone'
import Check from './Check';

const $fun = (v) => typeof v === 'function'
const $set = (o, n, v) => { o[n] = v; return o }
const $props = (o) => Object.keys(o).filter(n => !n.startsWith("$"))
const $try = (fn) => { try { fn() } catch (e) { return e } }

//
//header, like help are is not validation related at all
//but it does good to have everything grouped in same location
//
//since it is hard to pass i only to next generation than `a` is 
//introduced exclusively to flag the header check for array children
//`i` should be passed to next generations until next array changes it
//
const $check = (p, n, i, a) => {
    if (!("value" in p)) throw `ALERT: ${n} ${i} value not defined`
    if (!("label" in p)) throw `ALERT: ${n} ${i} label not defined`
    if (!("help" in p)) throw `ALERT: ${n} ${i} help not defined`
    if (!("check" in p)) throw `ALERT: ${n} ${i} check not defined`
    if (a && !("header" in p)) throw `ALERT: ${n} ${i} header not defined`
}

const $value = (p, n, i) => {
    switch (p.$type) {
        case "object": {
            return $props(p).reduce((o, n) => $set(o, n, $value(p[n], n, i)), {})
        }
        case "array": {
            const v = (i) => $props(p).reduce((o, n) => $set(o, n, $value(p[n], n, i, true)), {})
            const $v = p.$value
            return $fun($v) ? $v(v) : $v
        }
        default: {
            $check(p, n, i)
            const v = p.value
            return $fun(v) ? v(i, n) : v
        }
    }
}

const $merge = (p, t, n, i) => {
    switch (p.$type) {
        case "object": {
            const e = $try(() => Check.isObject(t, n))
            if (e) {
                addInvalid(`${e}`)
                return $value(p, n, i)
            }
            Object.keys(t).forEach(k => {
                if (k.startsWith("$") || !(k in p)) {
                    delete t[k]
                    addUnknown(`Prop ${k}: Unknown`)
                }
            })
            $props(p).forEach((n) => {
                t[n] = $merge(p[n], t[n], n, i)
            })
            return t
        }
        case "array": {
            const e = $try(() => { p.$check ? p.$check(t, n) : Check.isArray(t, n) })
            if (e) {
                addInvalid(`${e}`)
                return $value(p, n, i)
            }
            const pe = { ...p, $type: "object" }
            t.forEach((e, i) => t[i] = $merge(pe, e, n, i))
            return t
        }
        default: {
            $check(p, n, i)
            const $l = p.label
            const l = $fun($l) ? $l(i, n) : $l
            const e = $try(() => p.check(t, l))
            if (e) {
                addInvalid(`${e}`)
                return $value(p, n, i)
            }
            return t
        }
    }
}

const errors = init()

function init() {
    return {
        total: [],
        invalid: [],
        unknown: [],
    }
}

function clear() {
    const empty = init()
    errors.total = empty.total
    errors.invalid = empty.invalid
    errors.unknown = empty.unknown
}

function get() {
    return Clone.deep(errors)
}

function addUnknown(error) {
    errors.unknown.push(error)
    errors.total.push(error)
    Log.log(error)
}

function addInvalid(error) {
    errors.invalid.push(error)
    errors.total.push(error)
    Log.log(error)
}

function value(schema, index) {
    return $value(schema, undefined, index)
}

function merge(schema, target) {
    clear()
    return $merge(schema, target, "$target")
}

export default {
    value,
    merge,
    errors: {
        clear,
        init,
        get,
    },
}
