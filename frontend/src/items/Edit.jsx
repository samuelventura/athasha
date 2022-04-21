const key = "athasha.edit"

function fetch() {
    const json = localStorage.getItem(key)
    return json ? JSON.parse(json) : null
}

function remove() {
    localStorage.removeItem(key)
}

function create(state) {
    localStorage.setItem(key, JSON.stringify(state))
}

const exports = {
    fetch,
    remove,
    create,
}

export default exports
