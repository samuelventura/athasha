import React, { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { useAuth } from './Auth'
import { useAlert } from './Alert'
import Api from './Api'

function PageLogin(props) {
  const auth = useAuth()
  const alert = useAlert()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  function handleSubmit(e) {
    e.preventDefault()
    alert.warnAlert("Logging in...")
    Api.login(username, password)
      .then(session => auth.setSession(session))
      .then(() => alert.successAlert("PageLogin Success"))
      .catch(error => alert.errorAlert(error))
  }
  function validInput() {
    return username.trim().length > 0 &&
      password.trim().length > 0
  }
  return (
    <React.Fragment>
      <h1>PageLogin</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" placeholder="Username"
            value={username} onChange={e => setUsername(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={!validInput()}>Submit</Button>
      </Form>
    </React.Fragment>
  )
}

export default PageLogin
