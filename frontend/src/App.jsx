import React, { useState, useEffect, useReducer, useContext, useCallback } from 'react'
import Socket from './tools/Socket'

function initialAlert() { return { type: "", message: "" } }
function initialSessioner() {
  return {
    fetch: function () { },
    remove: function () { },
    create: function () { },
  }
}

const App = React.createContext({
  path: "",
  state: {},
  dispatch: () => { },
  logged: false,
  setLogged: () => { },
  connected: false,
  setConnected: () => { },
  login: false,
  setLogin: () => { },
  send: Socket.send,
  setSend: () => { },
  alert: initialAlert(),
  clearAlert: () => { },
  errorAlert: () => { },
  warnAlert: () => { },
  successAlert: () => { },
  sessioner: initialSessioner(),
})

function AppContext({ path, reducer, initial, sessioner, children }) {
  const [state, dispatch] = useReducer(reducer, initial())
  const [alert, setAlert] = useState(initialAlert())
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
    login, setLogin,
    logged, setLogged,
    connected, setConnected,
    send, setSend,
    alert, setAlert,
    clearAlert,
    errorAlert,
    warnAlert,
    successAlert,
    sessioner,
  }
  useEffect(() => {
    if (alert.type) {
      const timer = setTimeout(() => setAlert(initialAlert()), 500)
      return () => clearTimeout(timer)
    }
  }, [alert])
  useEffect(() => {
    function intercept(muta) {
      const { name, args } = muta
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
          const session = sessioner.fetch()
          send({ name: "login", args: { session, active } })
          break
        }
        case "login": {
          setLogin(true)
          if (args) { errorAlert("Login failed") }
          break
        }
        case "session": {
          clearAlert()
          setLogin(false)
          setLogged(true)
          break
        }
        default:
          dispatch(muta)
      }
    }
    return Socket.create({ path, dispatch: intercept })
  }, [path, initial, reducer, clearAlert, errorAlert])
  //auto reconnect item views
  //views listing never gets here
  useEffect(() => {
    if (login) {
      const timer = setInterval(() => {
        const session = sessioner.fetch()
        console.log(session)
        if (session.token) {
          const active = false
          send({ name: "login", args: { session, active } })
        }
      }, 2000)
      return () => { clearInterval(timer) }
    }
  }, [login, send])
  return <App.Provider value={value}>{children}</App.Provider>
}

function useApp() {
  return useContext(App)
}

export { AppContext, useApp }
