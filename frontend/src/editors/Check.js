import Environ from '../Environ'

function isString(value, label) {
    const typeof_value = typeof value
    if (!(typeof_value === 'string' || value instanceof String)) {
        throw `${label} is not string: ${typeof_value} ${value}`
    }
}

function isBoolean(value, label) {
    const typeof_value = typeof value
    if (!(typeof_value === 'boolean')) {
        throw `${label} is not boolean: ${typeof_value} ${value}`
    }
}

function isArray(value, label) {
    const typeof_value = typeof value
    if (!Array.isArray(value)) {
        throw `${label} is not array: ${typeof_value}`
    }
}

function notEmpty(value, label) {
    if (value.trim().length == 0) {
        throw `${label} is empty`
    }
}

function inList(value, label, list) {
    if (!list.includes(value)) {
        throw `${label} is not in ${list}`
    }
}

function isInteger(value, label) {
    const num = Number(value)
    if (!Number.isInteger(num)) {
        throw `${label} is not an integer`
    }
}

function isNumber(value, label) {
    const num = Number(value)
    if (!Number.isFinite(num)) {
        throw `${label} is not a number`
    }
}

function isGT(value, label, limit) {
    const num = Number(value)
    if (num <= limit) {
        throw `${label} is not > ${limit}`
    }
}

function isGE(value, label, limit) {
    const num = Number(value)
    if (num < limit) {
        throw `${label} is not >= ${limit}`
    }
}

function isLE(value, label, limit) {
    const num = Number(value)
    if (num > limit) {
        throw `${label} is not <= ${limit}`
    }
}

function isColor(value, label) {
    const re = /^#[0-9a-f]{6}/i
    if (!re.test(value)) {
        throw `${label} is not a color #RRGGBB`
    }
}

function nonZeroLength(value, label) {
    if (value.length === 0) {
        throw `${label} has zero length`
    }
}

function hasProp(value, label, prop) {
    //hasOwnProperties fails with proxy objects?
    if (!Object.keys(value).includes(prop)) {
        throw `${label} has no property: ${prop}`
    }
}

function props({ captured, setCaptured, label, hint, value, defval, setter, check }) {
    function recover() { return captured }
    function capture(value) { setCaptured(value) }
    function remove() { setCaptured(null) }
    function apply(e, val) {
        try {
            setter(val)
            check(val)
            capture(val)
            e.target.classList.remove("is-invalid");
            return true
        }
        catch (ex) {
            e.target.classList.add("is-invalid");
            return false
        }
    }
    return {
        value: value,
        title: `${label}\n${hint}`,
        placeholder: label,
        onFocus: function (e) {
            if (captured != null) {
                throw `Not null captured ${captured}`
            }
            capture(e.target.value)
            apply(e, e.target.value)
        },
        onKeyPress: function (e) {
            if (e.key === 'Enter') {
                apply(e, e.target.value)
            }
        },
        onChange: function (e) {
            apply(e, e.target.value)
        },
        onBlur: function (e) {
            if (!apply(e, recover())) apply(e, defval)
            remove()
        },
    }
}

function run(action) {
    try {
        action()
        Environ.log("Check: Pass")
        return true
    }
    catch (ex) {
        Environ.log("Check:", ex)
        return false
    }
}

function validate(values, inits, checks, label) {
    Object.keys(inits).forEach((prop) => {
        Check.hasProp(values, label, prop)
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
    isInteger,
    isNumber,
    isColor,
    isGT,
    isGE,
    isLE,
}
