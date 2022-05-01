function checkRange(value, min, max) {
    value = parseInt(`${value}`)
    if (max === undefined) {
        return min <= value
    }
    return min <= value && value <= max
}

function checkNotBlank(value) {
    return `${value}`.trim().length > 0
}

function checkBoolean(value) {
    return typeof (value) === "boolean"
}

//numbers to be stored as strings to preserve decimal value and format
//do not stringify values to detect which html controls do what
function fixInputValue(e, value, prev) {
    if (e) {
        const t = e.target
        if (t.tagName.toLowerCase() === "input") {
            const tt = t.getAttribute("type").toLowerCase()
            if (["range", "number"].includes(tt)) {
                const number = Number(value)
                if (t.hasAttribute("min")) {
                    const min = t.getAttribute("min")
                    if (number < Number(min)) {
                        value = prev
                    }
                }
                if (t.hasAttribute("max")) {
                    const max = t.getAttribute("max")
                    if (number > Number(max)) {
                        value = prev
                    }
                }
            }
            if (t.hasAttribute("pattern")) {
                if (!t.checkValidity()) {
                    value = prev
                }
            }
        }
    }
    return value
}

export {
    checkRange,
    checkNotBlank,
    checkBoolean,
    fixInputValue,
}
