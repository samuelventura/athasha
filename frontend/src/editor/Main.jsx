import React from 'react'
import { ConnectDialog } from '../Dialogs'
import { LoginDialog } from '../Dialogs'
import { AlertBanner } from '../Dialogs'
import EditItem from "./Editor"

function Main() {
  return (
    <>
      <AlertBanner />
      <LoginDialog />
      <ConnectDialog />
      <EditItem />
    </>
  )
}

export default Main
