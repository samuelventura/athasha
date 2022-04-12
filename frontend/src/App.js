import React, { useState } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOut } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from './Auth'
import { useAlert } from './Alert'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import Session from './Session'
import Socket from './Socket'
import './App.css'

function SocketDialog() {
  const auth = useAuth()
  const show = auth.send === Socket.send
  return (
    <Modal show={show} backdrop="static" centered>
      <Modal.Body>
        Connecting...
      </Modal.Body>
    </Modal>
  )
}

function LoginDialog() {
  const auth = useAuth()
  const alert = useAlert()
  const [password, setPassword] = useState("")
  function onLogin() {
    alert.warnAlert("Logging in...")
    const session = Session.create(password)
    auth.send({ name: "login", args: session })
  }
  function handleKeyUp(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      setPassword("")
    }
  }
  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      onLogin()
    }
  }
  const show = auth.send !== Socket.send
  return (
    <Modal show={show} backdrop="static" centered>
      <Modal.Header>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputGroup>
          <InputGroup.Text><FontAwesomeIcon icon={faKey} /></InputGroup.Text>
          <Form.Control autoFocus type="password" placeholder="Password"
            onKeyPress={handleKeyPress} onKeyUp={handleKeyUp}
            value={password} onChange={e => setPassword(e.target.value)} />
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onLogin}>Login</Button>
      </Modal.Footer>
    </Modal>
  )
}

function LogoutButton() {
  const auth = useAuth()
  const handleOnClick = () => {
    auth.setSession(Session.initial())
    Session.remove()
    window.location.reload()
  }
  const show = auth.session.token.length > 0
  return show ? (
    <Button variant="link" onClick={handleOnClick} title="Logout">
      <FontAwesomeIcon icon={faSignOut} />
    </Button>
  ) : null
}

function AlertBanner() {
  const alert = useAlert()
  const current = alert.current
  return current.type ? (
    <Alert variant={current.type} dismissible
      onClose={() => alert.clearAlert()}>
      {current.message}
    </Alert>
  ) : null
}

function App({ children }) {
  return (
    <div>
      <Navbar bg="light" variant="light">
        <Container>
          <Navbar.Brand className="btn" title="Home">
            <img src="logo28.png" alt="Athasha"></img>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text><LogoutButton /></Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <AlertBanner />
      <LoginDialog />
      <SocketDialog />
      <Container>
        {children}
      </Container>
    </div>
  )
}

export default App
