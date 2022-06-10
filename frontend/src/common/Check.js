import Log from '../tools/Log'

function $checkLabel(label) {
    if (label === undefined) throw "ALERT: Label is undefined"
    if (label === null) throw "ALERT: Label is null"
    if (label.trim().length === 0) throw "ALERT: Label is empty"
}

function isBoolean(value, label) {
    $checkLabel(label)
    const typeof_value = typeof value
    if (!(typeof_value === 'boolean')) {
        throw `${label} is not boolean: ${typeof_value} ${value}`
    }
}

function inList(value, label, list) {
    isString(value, label)
    if (!list.includes(value)) {
        throw `${label} is not in [${list}]`
    }
}

function isArray(value, label) {
    $checkLabel(label)
    const typeof_value = typeof value
    if (!Array.isArray(value)) {
        throw `${label} is not array: ${typeof_value} ${value}`
    }
    return value
}

function notEmptyArray(value, label) {
    const array = isArray(value, label)
    if (array.length === 0) {
        throw `${label} has zero length`
    }
}

function isString(value, label) {
    $checkLabel(label)
    const typeof_value = typeof value
    if (!(typeof_value === 'string' || value instanceof String)) {
        throw `${label} is not string: ${typeof_value} ${value}`
    }
}

function notEmpty(value, label) {
    isString(value, label)
    if (value.trim().length == 0) {
        throw `${label} is empty`
    }
}

function isInteger(value, label) {
    notEmpty(value, label)
    if (!value.match(/^\d+$/)) {
        throw `${label} is not integer: ${value}`
    }
}

function isNumber(value, label) {
    notEmpty(value, label)
    const num = Number(value)
    if (!Number.isFinite(num)) {
        throw `${label} is not number: ${value}`
    }
    return num
}

function isGT(value, label, limit) {
    const num = isNumber(value, label)
    if (num <= limit) {
        throw `${label} is not > ${limit}: ${value}`
    }
}

function isLT(value, label, limit) {
    const num = isNumber(value, label)
    if (num >= limit) {
        throw `${label} is not < ${limit}: ${value}`
    }
}

function isGE(value, label, limit) {
    const num = isNumber(value, label)
    if (num < limit) {
        throw `${label} is not >= ${limit}: ${value}`
    }
}

function isLE(value, label, limit) {
    const num = isNumber(value, label)
    if (num > limit) {
        throw `${label} is not <= ${limit}: ${value}`
    }
}

function notZero(value, label) {
    const num = isNumber(value, label)
    if (num === 0) {
        throw `${label} cannot be 0: ${value}`
    }
}

function isColor(value, label) {
    notEmpty(value, label)
    const re = /^#[0-9a-f]{6}/i
    if (!re.test(value)) {
        throw `${label} is not a color #RRGGBB: ${value}`
    }
}


function isObject(value, label) {
    $checkLabel(label)
    if (Array.isArray(value)) {
        throw `${label} is not object: array`
    }
    const typeof_value = typeof value
    if (typeof_value !== "object") {
        throw `${label} is not object: ${typeof_value}`
    }
}

function hasProp(value, label, prop) {
    isObject(value, label)
    if (!(prop in value)) {
        throw `${label} has no property ${prop}`
    }
    const prop_value = value[prop]
    if (prop_value === null) {
        throw `${label} has no property ${prop}: null`
    }
    if (prop_value === undefined) {
        throw `${label} has no property ${prop}: undefined`
    }
}

function debounce(func, wait) {
    let timeout
    let later
    let done
    function clear() {
        if (timeout) clearTimeout(timeout)
        timeout = null
    }
    function reset() {
        timeout = setTimeout(() => {
            timeout = null
            commit()
        }, wait)
    }
    function commit() {
        if (later) later()
        later = null
    }
    const apply = function () {
        const context = this, args = arguments
        if (done) {
            return func.apply(context, args)
        }
        later = function () {
            func.apply(context, args)
        }
        clear()
        reset()
    }
    function exit() {
        commit()
        clear()
        done = true
    }
    return { apply, exit }
}

function props({ checkbox, captured, setCaptured, label, hint, defval, getter, setter, check }) {
    function getCurrent(e) { return checkbox ? e.target.checked : e.target.value }
    function getValue() { return captured.value }
    function getDebounced() { return captured.debounced }
    function capture(value, debounced) {
        captured.value = value
        if (debounced) {
            captured.debounced = debounced
        }
        setCaptured({ ...captured })
    }
    function release() { setCaptured({}) }
    function apply(e, val) {
        try {
            //do not trigger full validations on each blur
            if (val != getter()) {
                setter(val)
                check(val)
                capture(val)
                e.target.classList.remove("is-invalid")
            }
            return true
        }
        catch (ex) {
            e.target.classList.add("is-invalid")
            Log.log(ex)
            return false
        }
    }
    const inputProps = {
        title: `${label}\n${hint}`,
        placeholder: label,
        onFocus: function (e) {
            if (captured.value != null) {
                throw `Not null captured ${captured}`
            }
            if ((!!checkbox) !== (e.target.type === "checkbox")) {
                throw `Checkbox mismatch ${!!checkbox} ${e.target.type}`
            }
            const debounced = e.target.type === "color" ? debounce(apply, 100) : {
                apply, exit: () => { }
            }
            capture(e.target.value, debounced)
            debounced.apply(e, getCurrent(e))
        },
        onKeyPress: function (e) {
            if (e.key === 'Enter') {
                e.preventDefault()
                const debounced = getDebounced()
                debounced.apply(e, getCurrent(e))
            }
        },
        onChange: function (e) {
            const debounced = getDebounced()
            debounced.apply(e, getCurrent(e))
        },
        onBlur: function (e) {
            const debounced = getDebounced()
            debounced.exit()
            if (!debounced.apply(e, getValue())) {
                debounced.apply(e, defval)
            }
            release()
        },
    }
    const valueProp = checkbox ? "checked" : "value"
    inputProps[valueProp] = getter()
    return inputProps
}

export default {
    $checkLabel,
    props,
    isBoolean,
    isString,
    notEmpty,
    isArray,
    notEmptyArray,
    isObject,
    hasProp,
    inList,
    isColor,
    notZero,
    isInteger,
    isNumber,
    isGT,
    isLT,
    isGE,
    isLE,
}
