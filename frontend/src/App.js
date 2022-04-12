import React, { useState, useEffect, useReducer, useContext } from 'react'
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
  const [state, dispatch] = useReducer(reducer, initial)
  const [alert, setAlert] = useState(initialAlert())
  const [session, setSession] = useState(Session.fetch())
  const [logged, setLogged] = useState(false)
  const [login, setLogin] = useState(false)
  const [connected, setConnected] = useState(false)
  const [send, setSend] = useState(() => Socket.send)
  const value = {
    path, state, dispatch,
    session, setSession,
    login, setLogin,
    logged, setLogged,
    connected, setConnected,
    send, setSend,
    alert, setAlert,
    clearAlert: () => setAlert(initialAlert()),
    errorAlert: (message) => setAlert({ type: "danger", message }),
    warnAlert: (message) => setAlert({ type: "warning", message }),
    successAlert: (message) => setAlert({ type: "success", message }),
  }
  useEffect(() => {
    if (alert.type === "success") {
      const timer = setTimeout(() => setAlert(initialAlert()), 500)
      return () => clearTimeout(timer)
    }
  }, [alert])
  useEffect(() => {
    return Socket.create({ path, dispatch })
  }, [path, dispatch])
  return <App.Provider value={value}>{children}</App.Provider>
}

function useApp() {
  return useContext(App)
}

export { AppContext, useApp }
