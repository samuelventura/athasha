import React, { useState, useContext } from 'react'
import PageLogin from './PageLogin'
import Api from './Api'

const initialSession = { id: "" }
const initialValue = { session: initialSession, setSession: () => { } }
const AuthContext = React.createContext(initialValue)

function AuthProvider({ children }) {
  const [session, setSession] = useState(Api.fetchSession(initialSession))
  const value = { session, setSession }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function RequireAuth({ children }) {
  const auth = useAuth()
  const valid = Api.validSession(auth.session)
  return valid ? children : <PageLogin />
}

function useAuth() {
  return useContext(AuthContext)
}

export { AuthProvider, RequireAuth, useAuth }
