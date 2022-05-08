
function isString(value, add, message) {
    if (!(typeof value === 'string' || value instanceof String)) {
        add({ value, message })
    }
}

export default {
    isString
}
