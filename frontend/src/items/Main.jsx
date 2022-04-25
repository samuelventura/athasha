import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import { ConnectDialog } from '../Dialogs'
import { LoginDialog } from '../Dialogs'
import { LogoutButton } from '../Dialogs'
import { AlertBanner } from '../Dialogs'
import { BackupButton } from './Dialogs'
import { RestoreButton } from './Dialogs'
import { useApp } from '../App'
import Browser from "./Browser"
import Logo from '../logo.svg'

function Main() {
  const app = useApp()
  return (
    <>
      <AlertBanner />
      <Navbar bg="light" variant="light">
        <Container>
          <Navbar.Brand title="Home">
            <img src={Logo} alt="Athasha" height="32"></img>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              <RestoreButton />
              <BackupButton />
              <LogoutButton />
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <LoginDialog />
      <ConnectDialog />
      <Container className='mt-3'>
        <Browser
          state={app.state}
          dispatch={app.dispatch}
          send={app.send}
        />
      </Container>
    </>
  )
}

export default Main
