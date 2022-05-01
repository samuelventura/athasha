const key = "athasha.edit"

function fetch() {
    const json = localStorage.getItem(key)
    return json ? JSON.parse(json) : null
}

function remove() {
    localStorage.removeItem(key)
}

function create(value) {
    localStorage.setItem(key, JSON.stringify(value))
}

const exports = {
    fetch,
    remove,
    create,
}

export default exports
