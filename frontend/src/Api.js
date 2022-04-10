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

const exports = {
    fetchSession,
    validSession,
    login,
    logout,
}

export default exports
