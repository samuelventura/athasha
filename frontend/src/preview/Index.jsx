import 'bootstrap/scss/bootstrap.scss'
import 'bootstrap'
import React from 'react'
import ReactDOM from 'react-dom'
import { AppContext } from '../App'
import Main from '../items/Main'
import State from '../items/State'
import './Index.css'

ReactDOM.render(
  <React.StrictMode>
    <AppContext path="preview"
      reducer={State.reducer}
      initial={State.initial}>
      <Main />
    </AppContext>
  </React.StrictMode>,
  document.getElementById('root')
)
