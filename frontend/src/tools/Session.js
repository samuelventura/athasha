import Encode from "./Encode"
import UUID from "./UUID"

function initial() { return { token: "", proof: "" } }

function api(key) {
    key = "athasha." + key
    function fetch() {
        const session = localStorage.getItem(key)
        return session ? JSON.parse(session) : initial()
    }

    function remove() {
        localStorage.removeItem(key)
    }

    function create(password) {
        const token = UUID.v4()
        const proof = Encode.SHA1(`${token}:${password}`)
        const session = { token, proof }
        localStorage.setItem(key, JSON.stringify(session))
        return session
    }
    return {
        fetch,
        remove,
        create,
    }
}

const exports = {
    api,
    initial,
}

export default exports
