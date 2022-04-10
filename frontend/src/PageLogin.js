import React, { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from './ContextAuth'
import { useAlert } from './ContextAlert'
import Api from './Api'

function PageLogin(props) {
  const auth = useAuth()
  const alert = useAlert()
  const [password, setPassword] = useState("")
  function handleSubmit(e) {
    e.preventDefault()
    alert.warnAlert("Logging in...")
    Api.login(password)
      .then(session => auth.setSession(session))
      .then(() => alert.successAlert("Login Success"))
      .catch(error => alert.errorAlert(error))
  }
  return (
    <React.Fragment>
      <div className='PageLogin'>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputGroup.Text><FontAwesomeIcon icon={faKey} /></InputGroup.Text>
            <Form.Control autoFocus type="password" placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)} />
            <Button variant="primary" type="submit">Login</Button>
          </InputGroup>
        </Form>
      </div>
    </React.Fragment>
  )
}

export default PageLogin
