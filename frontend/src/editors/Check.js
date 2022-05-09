import Environ from '../Environ'

function isString(value, label) {
    const typeof_value = typeof value
    if (!(typeof_value === 'string' || value instanceof String)) {
        throw  `${label} is not string: ${typeof_value}`
    }
}

function isArray(value, label) {
    const typeof_value = typeof value
    if (!Array.isArray(value)) {
        throw  `${label} is not array: ${typeof_value}`
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

function nonZeroLength(value, label) {
    if (value.length === 0) {
        throw `${label} has zero length`
    }
}

function hasProp(value, label, prop) {
    //hasOwnProperties failes with state objects
    if (!Object.keys(value).includes(prop)) {
        throw `${label} has no property: ${prop}`
    }
}

function props(label, value, setter, check) {
    function apply(e) {
        const next = e.target.value
        try {
            check(next)
            setter(next)
            e.__value = next
        }
        catch (ex) {
            Environ.log(ex)
            //FIXME add error class
        }
    }
    return {
        value: value,
        title: label,
        onFocus: function(e) {
            e.__value = e.target.value
        },
        onKeyPress: function(e) {
            if (e.key === 'Enter') {
                apply(e)
            }
        },
        onChange: function (e) {
            apply(e)
        },
        onBlur: function (e) {
            setter(value)
            //FIXME remove error class
        },
    }
}

function run(action) {
    try { 
        action() 
        return true
    }
    catch(ex) {
        Environ.log(ex)
        return false
    }
}

export default {
    run,
    props,
    isString,
    isArray,
    notEmpty,
    inList,
    nonZeroLength,
    hasProp,
}
