import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App'
import Home from './Home'
import { AlertProvider } from './Alert'
import { AuthProvider } from './Auth'

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <AlertProvider>
        <App>
          <Home />
        </App>
      </AlertProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
