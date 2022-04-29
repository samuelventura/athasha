import React, { useEffect } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import { ConnectDialog } from '../Dialogs'
import { LoginDialog } from '../Dialogs'
import { LogoutButton } from '../Dialogs'
import { AlertBanner } from '../Dialogs'
import Logo from '../logo.svg'
import View from './Screen'
import { useApp } from '../App'

function Main() {
  const app = useApp()
  const name = app.state.name
  useEffect(() => {
    document.title = name ? `Athasha - ${name}` : "Athasha View"
  }, [name])
  return (
    <div className="vh-100 d-flex flex-column">
      <div>
        <AlertBanner />
        <Navbar bg="light" variant="light">
          <Container>
            <Navbar.Brand>
              <img src={Logo} alt="Athasha" height="32"></img>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
                {name}
              </Navbar.Text>
              <Navbar.Text>
                <LogoutButton />
              </Navbar.Text>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <LoginDialog />
        <ConnectDialog />
      </div>
      <div className="h-100">
        <View />
      </div>
    </div>
  )
}

export default Main
