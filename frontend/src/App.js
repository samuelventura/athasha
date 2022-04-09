import React from 'react'
import { Outlet, useNavigate } from "react-router-dom"
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import {useAuth, initialSession} from './Auth'
import {useAlert} from './Alert'
import './App.css'

function Username() {
  const auth = useAuth()
  const handleOnClick = () => auth.setSession(initialSession)
  if (!auth.session.id.startsWith(":")) return (
    <Button variant="link" onClick={handleOnClick} title="Logout">
      {auth.session.username}
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
      <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand className="btn" onClick={handleOnClick} 
          title="Home">Athasha</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text><Username/></Navbar.Text>
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
