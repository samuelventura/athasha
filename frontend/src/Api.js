
function hasAccess(session, required) {
    const granted = session.roles || []
    return required.length === 0 || 
        required.some(req => granted.indexOf(req)>=0) || 
        session.id === ":open:" //empty user database
}

//session must be destroyed with tab
function fetchSession() {
    const session = localStorage.getItem("ash.session")
    return session ? JSON.parse(session) : null
}

function saveSession(session) {
    return localStorage.setItem("ash.session", JSON.stringify(session))
}

//targeted login should only create session if required roles are met
function login(username, password, required) {
    const session = {id: username, roles: [password], uid: 1, username}
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (hasAccess(session, required)) {
                resolve(session)
            } else {
                reject("Invalid credentials")
            }
        }, 200)
      })
}

function logout() {
    localStorage.removeItem("ash.session")
}

const exports = { 
    fetchSession,
    saveSession,
    hasAccess,
    login,
    logout,
}

export default exports
