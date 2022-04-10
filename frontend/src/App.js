import React from 'react'
import { Outlet, useNavigate } from "react-router-dom"
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOut } from '@fortawesome/free-solid-svg-icons'
import { useAuth, initialSession } from './ContextAuth'
import { useAlert } from './ContextAlert'
import Api from './Api'
import './App.css'

function Logout() {
  const auth = useAuth()
  const handleOnClick = () => {
    auth.setSession(initialSession)
    Api.logout()
  }
  if (Api.validSession(auth.session)) return (
    <Button variant="link" onClick={handleOnClick} title="Logout">
      <FontAwesomeIcon icon={faSignOut} />
    </Button>
  )
  return null
}

function showAlert(alert) {
  const current = alert.current
  if (current.type) {
    return (<Alert variant={current.type} dismissible
      onClose={() => alert.clearAlert()}>
      {current.message}
    </Alert>)
  }
  return null
}

//App component acts like app layout
//Navbar.Brand made pointer cursor with class btn
function App() {
  const alert = useAlert()
  const navigate = useNavigate()
  const handleOnClick = () => navigate("/", { replace: true })
  return (
    <React.Fragment>
      <Navbar bg="light" variant="light">
        <Container>
          <Navbar.Brand className="btn" onClick={handleOnClick}
            title="Home"><img src="logo28.png"></img></Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text><Logout /></Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {showAlert(alert)}
      <Container>
        <Outlet />
      </Container>
    </React.Fragment>
  )
}

export default App
