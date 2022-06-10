import Log from '../tools/Log'
import Clone from '../tools/Clone'
import Check from './Check';

const $fun = (v) => typeof v === 'function'
const $set = (o, n, v) => { o[n] = v; return o }
const $props = (o) => Object.keys(o).filter(n => !n.startsWith("$"))
const $value = (p, n, i) => {
    switch (p.$type) {
        case "object": {
            return $props(p).reduce((o, n) => $set(o, n, $value(p[n], n)), {})
        }
        case "array": {
            const v = (i) => $props(p).reduce((o, n) => $set(o, n, $value(p[n], n, i)), {})
            const $v = p.$value
            return $fun($v) ? $v(v) : $v
        }
        default: {
            const v = p.value
            return $fun(v) ? v(i, n) : v
        }
    }
}

const $merge = (p, t, n, i) => {
    switch (p.$type) {
        case "object": {
            try {
                Check.isObject(t, n)
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
            catch (e) {
                addInvalid(`${e}`)
                return $value(p, n, i)
            }
        }
        case "array": {
            try { p.$check ? p.$check(t, n) : Check.isArray(t, n) }
            catch (e) {
                addInvalid(`${e}`)
                return $value(p, n, i)
            }
            const pe = { ...p, $type: "object" }
            t.forEach((e, i) => t[i] = $merge(pe, e, n, i))
            return t
        }
        default: {
            if (!p.label) throw `ALERT: ${n} ${i} label not defined`
            if (!p.help) throw `ALERT: ${n} ${i} help not defined`
            if (i !== undefined && !p.header) throw `ALERT: ${n} ${i} header not defined`
            const $l = p.label
            const l = $fun($l) ? $l(i, n) : $l
            try {
                p.check(t, l)
                return t
            } catch (e) {
                addInvalid(`${e}`)
                return $value(p, n, i)
            }
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

function value(schema) {
    return $value(schema)
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
