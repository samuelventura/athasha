import 'bootstrap/scss/bootstrap.scss'
import 'bootstrap'
import React from 'react'
import ReactDOM from 'react-dom'
import { AppContext } from '../App'
import Session from '../tools/Session'
import Router from '../tools/Router'
import Main from './Main'
import State from './State'
import './Index.css'

ReactDOM.render(
  <React.StrictMode>
    <AppContext path="screen"
      reducer={State.reducer}
      initial={State.initial}
      sessioner={Session.api("screen" + Router.wsQuery)}>
      <Main />
    </AppContext>
  </React.StrictMode>,
  document.getElementById('root')
)
