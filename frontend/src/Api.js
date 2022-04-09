function validSession(session) {
    return session.id !== ":none:"
}

function fetchSession() {
    const session = localStorage.getItem("athasha.session")
    return session ? JSON.parse(session) : null
}

function saveSession(session) {
    return localStorage.setItem("athasha.session", JSON.stringify(session))
}

function login(username, password) {
    const session = { id: username }
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (validSession(session)) {
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

const exports = {
    fetchSession,
    saveSession,
    validSession,
    login,
    logout,
}

export default exports
