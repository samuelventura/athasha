import { useState } from 'react'
import Environ from '../Environ'

function isString(value, label) {
    const typeof_value = typeof value
    if (!(typeof_value === 'string' || value instanceof String)) {
        throw `${label} is not string: ${typeof_value}`
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

function props({captured, setCaptured, label, value, setter, check}) {
    function recover(e) { return captured }
    function capture(e) { 
        setCaptured(e.target.value) 
    }
    function clear(e) { 
        setCaptured("") 
    }
    function apply(e) {
        const next = e.target.value
        setter(next)
        try {
            check(next)
            capture(e)
            e.target.classList.remove("is-invalid");
        }
        catch (ex) {
            Environ.log(ex)
            e.target.classList.add("is-invalid");
        }
    }
    return {
        value: value,
        title: label,
        onFocus: function (e) {
            capture(e)
            apply(e)
        },
        onKeyPress: function (e) {
            if (e.key === 'Enter') {
                apply(e)
            }
        },
        onChange: function (e) {
            apply(e)
        },
        onBlur: function (e) {
            setter(recover(e))
            clear(e)
            e.target.classList.remove("is-invalid");
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
