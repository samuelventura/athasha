
function json_clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function deep(obj) {
    if (obj === null) return null
    if (obj === undefined) return undefined
    return window.structuredClone ?
        window.structuredClone(obj) : json_clone(obj)
}

function shallow(obj) {
    if (obj === null) return null
    if (obj === undefined) return undefined
    if (Array.isArray(obj)) return [...obj]
    return { ...obj }
}

export default {
    shallow,
    deep,
}
