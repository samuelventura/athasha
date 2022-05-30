import 'bootstrap/scss/bootstrap.scss'
import 'bootstrap'
import React from 'react'
import ReactDOM from 'react-dom'
import { AppContext } from '../App'
import Session from '../tools/Session'
import Main from './Main'
import State from './State'
import './Index.css'

//share session with items
ReactDOM.render(
  <React.StrictMode>
    <AppContext path="editor"
      reducer={State.reducer}
      initial={State.initial}
      sessioner={Session.api("items")}>
      <Main />
    </AppContext>
  </React.StrictMode>,
  document.getElementById('root')
)
