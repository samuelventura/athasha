import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App'
import PageHome from './PageHome'
import PageAdmin from './PageAdmin'
import { AlertProvider } from './Alert'
import { AuthProvider, RequireAuth } from './Auth'

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
          <Routes>
            <Route path="/" element={<App />}>
              <Route path="" element={<RequireAuth><PageHome /></RequireAuth>} />
              <Route path="/admin" element={<RequireAuth><PageAdmin /></RequireAuth>} />
              <Route path="*" element={<div>404</div>} />
            </Route>
          </Routes>
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
