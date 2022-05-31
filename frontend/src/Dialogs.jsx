import React, { useState, useEffect, useRef } from 'react'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Dropdown from 'react-bootstrap/Dropdown'
import InputGroup from 'react-bootstrap/InputGroup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEthernet } from '@fortawesome/free-solid-svg-icons'
import { faSignOut } from '@fortawesome/free-solid-svg-icons'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import Router from './tools/Router'
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
  function onLogout() {
    setPassword("")
    sessioner.remove()
  }
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
  return app.login ? (
    <Modal show={true} backdrop="static" centered>
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
        <Button variant="secondary" onClick={onLogout}>Logout</Button>
        <Button variant="primary" onClick={onLogin}>Login</Button>
      </Modal.Footer>
    </Modal>
  ) : null
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

function HostButton() {
  const app = useApp()
  const addresses = [app.state.hostname, ...app.state.addresses, "localhost", "127.0.0.1"]
  const dropdownItems = addresses.map((ip, index) =>
    <Dropdown.Item key={index} href={Router.reHost(ip)}>{ip}</Dropdown.Item>
  )
  return app.logged ? (
    <Dropdown className="d-inline">
      <Dropdown.Toggle variant="link" title="Change Hostname/IP">
        <FontAwesomeIcon icon={faEthernet} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {dropdownItems}
      </Dropdown.Menu>
    </Dropdown>
  ) : null
}

function RenameItem() {
  const app = useApp()
  const targeted = app.state.targeted
  const action = targeted.action
  const item = targeted.item
  const focus = useRef(null)
  const [name, setName] = useState("")
  function isActive() { return action === "rename" }
  function isValid() { return (name.trim().length) }
  function onKeyPress(e) {
    if (e.key === 'Enter') {
      onAccept()
    }
  }
  function onCancel() {
    app.dispatch({ name: "target", args: {} })
  }
  function onAccept() {
    if (isValid()) {
      app.send({ name: "rename", args: { id: item.id, name } })
      app.dispatch({ name: "target", args: {} })
    }
  }
  useEffect(() => {
    if (isActive()) {
      setName(item.name)
      //autoFocus fails with inputs but works with select above
      setTimeout(() => {
        const el = focus.current
        if (el) {
          el.focus()
          el.select()
        }
      }, 0)
    }
  }, [targeted.action])
  return (
    <Modal show={isActive()} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Rename</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control autoFocus ref={focus} type="text" placeholder="New Name"
          onKeyPress={onKeyPress}
          value={name} onChange={e => setName(e.target.value)} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onAccept} disabled={!isValid()}>
          Rename
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export {
  ConnectDialog,
  LoginDialog,
  LogoutButton,
  AlertBanner,
  HostButton,
  RenameItem,
}
