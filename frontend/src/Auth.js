import React, { useState, useContext } from 'react'
import Socket from './Socket'
import Session from './Session'

const AuthContext = React.createContext({
  session: Session.initial(),
  setSession: () => { },
  login: false,
  setLogin: () => { },
  send: Socket.send,
  setSend: () => { },
})

function AuthProvider({ children }) {
  const [session, setSession] = useState(Session.fetch())
  const [login, setLogin] = useState(false)
  const [send, setSend] = useState(() => Socket.send)
  const value = { session, setSession, login, setLogin, send, setSend }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  return useContext(AuthContext)
}

export { AuthProvider, useAuth }
