import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import { ConnectDialog } from '../Dialogs'
import { LoginDialog } from '../Dialogs'
import { LogoutButton } from '../Dialogs'
import { HostButton } from '../Dialogs'
import { AlertBanner } from '../Dialogs'
import { InfoButton } from './Dialogs'
import { ToolsButton } from './Dialogs'
import Browser from "./Browser"
import Logo from '../logo.svg'

function Main() {
  return (
    <>
      <AlertBanner />
      <Navbar bg="light" variant="light">
        <Container>
          <Navbar.Brand title="athasha.io">
            <a href="https://athasha.io" target="_blank" rel="noreferrer">
              <img src={Logo} alt="Athasha" height="40"></img>
            </a>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              <span className='d-flex align-items-center'>
                <HostButton />
                <ToolsButton />
                <InfoButton />
                <LogoutButton />
              </span>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <LoginDialog />
      <ConnectDialog />
      <Container className='mt-3'>
        <Browser />
      </Container>
    </>
  )
}

export default Main
