import Log from '../tools/Log'

function checkLabel(label) {
    if (label === undefined) {
        Log.log("ALERT: Label is undefined")
        return
    }
    if (label === null) {
        Log.log("ALERT: Label is null")
        return
    }
    if (label.trim() === "") Log.log("ALERT: Label is empty")
}

function isString(value, label) {
    checkLabel(label)
    const typeof_value = typeof value
    if (!(typeof_value === 'string' || value instanceof String)) {
        throw `${label} is not string: ${typeof_value} ${value}`
    }
}

function isBoolean(value, label) {
    checkLabel(label)
    const typeof_value = typeof value
    if (!(typeof_value === 'boolean')) {
        throw `${label} is not boolean: ${typeof_value} ${value}`
    }
}

function isArray(value, label) {
    checkLabel(label)
    const typeof_value = typeof value
    if (!Array.isArray(value)) {
        throw `${label} is not array: ${typeof_value}`
    }
}

function notEmpty(value, label) {
    checkLabel(label)
    if (value.trim().length == 0) {
        throw `${label} is empty`
    }
}

function inList(value, label, list) {
    checkLabel(label)
    if (!list.includes(value)) {
        throw `${label} is not in ${list}`
    }
}

function isInteger(value, label) {
    checkLabel(label)
    const num = Number(value)
    if (!Number.isInteger(num)) {
        throw `${label} is not an integer`
    }
}

function isNumber(value, label) {
    checkLabel(label)
    const num = Number(value)
    if (!Number.isFinite(num)) {
        throw `${label} is not a number`
    }
}

function isGT(value, label, limit) {
    checkLabel(label)
    const num = Number(value)
    if (num <= limit) {
        throw `${label} is not > ${limit}`
    }
}

function isGE(value, label, limit) {
    checkLabel(label)
    const num = Number(value)
    if (num < limit) {
        throw `${label} is not >= ${limit}`
    }
}

function isLE(value, label, limit) {
    checkLabel(label)
    const num = Number(value)
    if (num > limit) {
        throw `${label} is not <= ${limit}`
    }
}

function notZero(value, label) {
    checkLabel(label)
    const num = Number(value)
    if (num === 0) {
        throw `${label} is cannot be 0`
    }
}

function isColor(value, label) {
    checkLabel(label)
    const re = /^#[0-9a-f]{6}/i
    if (!re.test(value)) {
        throw `${label} is not a color #RRGGBB`
    }
}

function nonZeroLength(value, label) {
    checkLabel(label)
    if (value.length === 0) {
        throw `${label} has zero length`
    }
}

function hasProp(value, label, prop) {
    checkLabel(label)
    //hasOwnProperties fails with proxy objects?
    if (!Object.keys(value).includes(prop)) {
        throw `${label} has no property: ${prop}`
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

function props({ captured, setCaptured, label, hint, defval, getter, setter, check }) {
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
    return {
        value: getter(),
        title: `${label}\n${hint}`,
        placeholder: label,
        onFocus: function (e) {
            if (captured.value != null) {
                throw `Not null captured ${captured}`
            }
            const debounced = e.target.type === "color" ? debounce(apply, 100) : {
                apply, exit: () => { }
            }
            capture(e.target.value, debounced)
            debounced.apply(e, e.target.value)
        },
        onKeyPress: function (e) {
            if (e.key === 'Enter') {
                e.preventDefault()
                const debounced = getDebounced()
                debounced.apply(e, e.target.value)
            }
        },
        onChange: function (e) {
            const debounced = getDebounced()
            debounced.apply(e, e.target.value)
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
}

// function time(action) {
//     const start = new Date();
//     action()
//     const end = new Date();
//     const diff = end.getTime() - start.getTime()
//     Log.log("elapsed", diff)
// }

function run(action) {
    try {
        action()
        Log.log("Check: Pass")
        return true
    }
    catch (ex) {
        Log.log("Check:", ex)
        return false
    }
}

function validate(values, inits, checks, label) {
    Object.keys(inits).forEach((prop) => {
        hasProp(values, label, prop)
        checks[prop](values[prop])
    })
}

export default {
    validate,
    run,
    props,
    isBoolean,
    isString,
    isArray,
    notEmpty,
    inList,
    nonZeroLength,
    hasProp,
    notZero,
    isInteger,
    isNumber,
    isColor,
    isGT,
    isGE,
    isLE,
}
