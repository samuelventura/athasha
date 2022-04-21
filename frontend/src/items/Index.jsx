import React from 'react'
import ReactDOM from 'react-dom'
import { AppContext } from '../App'
import Main from './Main'
import State from './State'
import './Index.css'

ReactDOM.render(
  <React.StrictMode>
    <AppContext path="items"
      reducer={State.reducer}
      initial={State.initial}>
      <Main />
    </AppContext>
  </React.StrictMode>,
  document.getElementById('root')
)
