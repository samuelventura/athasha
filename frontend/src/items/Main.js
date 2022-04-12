import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import { ConnectDialog } from '../AppUI'
import { LoginDialog } from '../AppUI'
import { LogoutButton } from '../AppUI'
import { AlertBanner } from '../AppUI'
import { useApp } from '../App'
import Browser from "./Browser"

function Main() {
  const app = useApp()
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
      <Container className='mt-3'>
        <Browser
          state={app.state}
          dispatch={app.dispatch}
          send={app.send}
        />
      </Container>
    </div>
  )
}

export default Main
