import React, { useState, useEffect, useReducer, useContext, useCallback } from 'react'
import Socket from './Socket'
import Session from './Session'

function initialAlert() { return { type: "", message: "" } }

const App = React.createContext({
  path: "",
  state: {},
  dispatch: () => { },
  session: Session.initial(),
  setSession: () => { },
  logged: false,
  setLogged: () => { },
  login: false,
  setLogin: () => { },
  send: Socket.send,
  setSend: () => { },
  alert: initialAlert(),
  clearAlert: () => { },
  errorAlert: () => { },
  warnAlert: () => { },
  successAlert: () => { },
})

function AppContext({ path, reducer, initial, children }) {
  const [state, dispatch] = useReducer(reducer, initial())
  const [alert, setAlert] = useState(initialAlert())
  const [session, setSession] = useState(Session.initial())
  const [logged, setLogged] = useState(false)
  const [login, setLogin] = useState(false)
  const [connected, setConnected] = useState(false)
  const [send, setSend] = useState(() => Socket.send)
  const clearAlert = useCallback(() => setAlert(initialAlert()), [])
  const errorAlert = useCallback((message) => setAlert({ type: "danger", message }), [])
  const warnAlert = useCallback((message) => setAlert({ type: "warning", message }), [])
  const successAlert = useCallback((message) => setAlert({ type: "success", message }), [])
  const value = {
    path,
    state, dispatch,
    session, setSession,
    login, setLogin,
    logged, setLogged,
    connected, setConnected,
    send, setSend,
    alert, setAlert,
    clearAlert,
    errorAlert,
    warnAlert,
    successAlert,
  }
  useEffect(() => {
    if (alert.type === "success") {
      const timer = setTimeout(() => setAlert(initialAlert()), 500)
      return () => clearTimeout(timer)
    }
  }, [alert])
  useEffect(() => {
    function intercept({ name, args }) {
      switch (name) {
        case "close": {
          clearAlert()
          setLogged(false)
          setLogin(false)
          setConnected(false)
          setSend(() => Socket.send)
          dispatch({ name, args })
          break
        }
        case "open": {
          const send = args
          setSend(() => send)
          setConnected(true)
          const active = false
          const session = Session.fetch()
          send({ name: "login", args: { session, active } })
          break
        }
        case "login": {
          setLogin(true)
          setSession(Session.initial())
          if (args) { errorAlert("Login failed") }
          break
        }
        case "session": {
          clearAlert()
          const session = args
          setLogin(false)
          setLogged(true)
          setSession(session)
          break
        }
        default:
          dispatch({ name, args })
      }
    }
    return Socket.create({ path, dispatch: intercept })
  }, [path, initial, reducer, clearAlert, errorAlert])
  return <App.Provider value={value}>{children}</App.Provider>
}

function useApp() {
  return useContext(App)
}

export { AppContext, useApp }
