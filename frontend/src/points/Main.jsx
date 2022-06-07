import React, { useEffect } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import { ConnectDialog } from '../Dialogs'
import { LoginDialog } from '../Dialogs'
import { LogoutButton } from '../Dialogs'
import { AlertBanner } from '../Dialogs'
import Logo from '../logo.svg'
import View from './View'
import { useApp } from '../App'

function Main() {
  const app = useApp()
  const name = app.state.name
  const type = app.state.type
  useEffect(() => {
    if (name) document.title = `Athasha ${type} Viewer - ${name}`
  }, [name])
  function NameColor() {
    const status = app.state.status
    switch (status.type) {
      case "error":
        return "text-danger";
      case "warn":
        return "text-warning";
      default:
        return "text-secondary";
    }
  }
  function NameTitle() {
    const status = app.state.status
    switch (status.type) {
      case "success":
        return "";
      default:
        return status.msg;
    }
  }
  const nameColor = NameColor()
  const nameTitle = NameTitle()
  return (
    <div className="vh-100 d-flex flex-column">
      <div>
        <AlertBanner />
        <Navbar bg="light" variant="light">
          <Container>
            <Navbar.Brand>
              <img src={Logo} alt="Athasha" height="40"></img>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text className={nameColor} title={nameTitle}>
                <span className="user-select-none">{name}</span>
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
      <Container>
        <View />
      </Container>
    </div>
  )
}

export default Main
