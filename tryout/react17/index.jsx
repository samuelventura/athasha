//entry point to import all elements to be bundle
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'
import ReactDOM from 'react-dom'
import React from 'react'
import App from './app'

ReactDOM.render(
    <App />,
    document.getElementById('root')
)
