import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import { ConnectDialog } from '../Dialogs'
import { HostButton } from '../Dialogs'
import Browser from "./Browser"
import Logo from '../logo.svg'

function Main() {
  return (
    <>
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
              </span>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <ConnectDialog />
      <Container className='mt-3'>
        <Browser />
      </Container>
    </>
  )
}

export default Main
