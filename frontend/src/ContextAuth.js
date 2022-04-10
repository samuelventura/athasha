import React, { useState, useContext } from 'react'
import PageLogin from './PageLogin'
import Api from './Api'

// Single super user authentication
const initialSession = { id: "" }
const initialValue = { session: initialSession, setSession: () => { } }
const AuthContext = React.createContext(initialValue)

//based on https://kentcdodds.com/blog/how-to-use-react-context-effectively
function AuthProvider({ children }) {
  const [session, setSession] = useState(Api.fetchSession(initialSession))
  const value = { session, setSession }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  return useContext(AuthContext)
}

//https://gist.github.com/mjackson/d54b40a094277b7afdd6b81f51a0393f
function RequireAuth({ children }) {
  const auth = useAuth()
  const valid = Api.validSession(auth.session)
  return valid ? children : <PageLogin />
}

export { AuthProvider, RequireAuth, useAuth, initialSession }
