import React, { useState, useContext } from 'react'
import Login from './Login'
import Api from './Api'

// :open: empty user database
// :none: not logged in or invalid credentials
// 20211122T..... real session id
const initialSession = {id: ":none:", roles: [], uid: 0, username: ""}
const initialValue = {session: initialSession, setSession: () => {}}
const AuthContext = React.createContext(initialValue)

//based on https://kentcdodds.com/blog/how-to-use-react-context-effectively
function AuthProvider({children}) {
  const [session, setSession] = useState(Api.fetchSession() || initialSession)
  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = {session, setSession: (session) => {
    Api.saveSession(session)
    setSession(session)
  }}
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  return useContext(AuthContext)
}

//https://gist.github.com/mjackson/d54b40a094277b7afdd6b81f51a0393f
function RequireAuth({children, roles}) {
  const auth = useAuth()
  const required = roles || []
  const access = Api.hasAccess(auth.session, required)
  return access ? children : <Login roles={required}/>
}

export {AuthProvider, RequireAuth, useAuth, initialSession}
