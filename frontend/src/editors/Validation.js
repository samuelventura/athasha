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

export { checkRange, checkNotBlank, checkBoolean }
