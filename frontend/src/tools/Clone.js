
function json_clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function deep(obj) {
    if (obj === null) return null
    if (obj === undefined) return undefined
    return structuredClone ?
        structuredClone(obj) : json_clone(obj)
}

function shallow(obj) {
    if (obj === null) return null
    if (obj === undefined) return undefined
    return { ...obj }
}

export default {
    deep,
    shallow,
}
