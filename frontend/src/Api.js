function validSession(session) {
    return session.id.length > 0
}

function fetchSession(initial) {
    const session = localStorage.getItem("athasha.session")
    return JSON.parse(session || JSON.stringify(initial))
}

function login(password) {
    const session = { id: "session" }
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (validSession(session)) {
                localStorage.setItem("athasha.session", JSON.stringify(session))
                resolve(session)
            } else {
                reject("Invalid credentials")
            }
        }, 200)
    })
}

function logout() {
    localStorage.removeItem("athasha.session")
}

async function encode(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

//crypto.randomUUID()
//await encode("hey")
//:crypto.hash(:sha256, "hey") |> Base.encode16() |> String.downcase()
window.encode = encode

const exports = {
    fetchSession,
    validSession,
    login,
    logout,
    encode,
}

export default exports
