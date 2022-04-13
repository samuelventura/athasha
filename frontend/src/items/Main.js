import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import { ConnectDialog } from '../Dialogs'
import { LoginDialog } from '../Dialogs'
import { LogoutButton } from '../Dialogs'
import { AlertBanner } from '../Dialogs'
import { useApp } from '../App'
import Browser from "./Browser"

function Main() {
  const app = useApp()
  return (
    <div className="vh-100 d-flex flex-column">
      <Navbar bg="light" variant="light">
        <Container>
          <Navbar.Brand title="Home">
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
      <Container className='mt-3 flex-fill'>
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
