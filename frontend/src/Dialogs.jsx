import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOut } from '@fortawesome/free-solid-svg-icons'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import { useApp } from './App'

function ConnectDialog() {
  const app = useApp()
  return (
    <Modal show={!app.connected} backdrop="static" centered>
      <Modal.Body>
        Connecting...
      </Modal.Body>
    </Modal>
  )
}

function LoginDialog() {
  const app = useApp()
  const sessioner = app.sessioner
  const [password, setPassword] = useState("")
  function onLogin() {
    app.warnAlert("Logging in...")
    const active = true
    const session = sessioner.create(password)
    app.send({ name: "login", args: { session, active } })
  }
  function handleKeyUp(e) {
    if (e.key === 'Escape') {
      setPassword("")
    }
  }
  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      onLogin()
    }
  }
  //auto reconnect views
  useEffect(() => {
    if (!app.logged) {
      const session = sessioner.fetch()
      if (session.token) {
        const timer = setInterval(() => {
          const active = false
          app.send({ name: "login", args: { session, active } })
        }, 5000)
        return () => { clearInterval(timer) }
      }
    }
  }, [app.logged])
  return (
    <Modal show={app.login} backdrop="static" centered>
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
  const app = useApp()
  const sessioner = app.sessioner
  const handleOnClick = () => {
    sessioner.remove()
    window.location.reload()
  }
  return app.logged ? (
    <Button variant="link" onClick={handleOnClick} title="Logout">
      <FontAwesomeIcon icon={faSignOut} />
    </Button>
  ) : null
}

function AlertBanner() {
  const app = useApp()
  const alert = app.alert
  return alert.type ? (
    <Alert variant={alert.type} dismissible
      style={{ zIndex: '9999' }}
      className='fixed-top'
      onClose={() => app.clearAlert()}>
      {alert.message}
    </Alert>
  ) : null
}

export {
  ConnectDialog,
  LoginDialog,
  LogoutButton,
  AlertBanner,
}
