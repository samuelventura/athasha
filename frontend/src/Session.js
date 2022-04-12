import sha1 from 'sync-sha1/rawSha1'

function initial() { return { token: "", proof: "" } }

const key = "athasha.session"

function fetch() {
    const session = localStorage.getItem(key)
    return session ? JSON.parse(session) : initial()
}

function remove() {
    localStorage.removeItem(key)
}

function create(password) {
    const token = crypto.randomUUID();
    const proof = encode(`${token}:${password}`);
    const session = { token, proof }
    localStorage.setItem(key, JSON.stringify(session))
    return session
}

//encode("uuid")
//:crypto.hash(:sha, "uuid") |> Base.encode16() |> String.downcase()
function encode(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = sha1(msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const exports = {
    fetch,
    remove,
    create,
    initial,
}

export default exports
