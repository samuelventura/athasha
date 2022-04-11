import sha1 from 'sync-sha1/rawSha1'

const initial = {
    token: "",
    proof: "",
}

function key(path) {
    return `athasha.session.${path}`
}

function fetch(path) {
    const session = localStorage.getItem(key(path))
    return JSON.parse(session || JSON.stringify(initial))
}

function remove(path) {
    localStorage.removeItem(key(path))
}

function create(path, password) {
    const token = crypto.randomUUID();
    const proof = encode(`${token}:${password}`);
    const session = { token, proof }
    localStorage.setItem(key(path), JSON.stringify(session))
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
}

export default exports
