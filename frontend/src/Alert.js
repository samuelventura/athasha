import React, { useState, useContext } from 'react'

function initial() { return { type: "", message: "" } }

const AlertContext = React.createContext({
  current: initial(),
  clearAlert: () => { },
  errorAlert: () => { },
  warnAlert: () => { },
  successAlert: () => { }
})

function AlertProvider({ children }) {
  const [alert, setAlert] = useState(initial())
  const value = {
    current: alert,
    clearAlert: () => setAlert(initial()),
    errorAlert: (message) => setAlert({ type: "danger", message }),
    warnAlert: (message) => setAlert({ type: "warning", message }),
    successAlert: (message) => setAlert({ type: "success", message }),
  }
  React.useEffect(() => {
    if (alert.type === "success") {
      const timer = setTimeout(() => setAlert(initial()), 500)
      return () => clearTimeout(timer)
    }
  }, [alert])
  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
}

function useAlert() {
  return useContext(AlertContext)
}

export { AlertProvider, useAlert }
