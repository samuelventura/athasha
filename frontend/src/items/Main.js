import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import { ConnectDialog } from '../AppUI'
import { LoginDialog } from '../AppUI'
import { LogoutButton } from '../AppUI'
import { AlertBanner } from '../AppUI'

function Main({ children }) {
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
      <ConnectDialog />
      <Container>
        {children}
      </Container>
    </div>
  )
}

export default Main
