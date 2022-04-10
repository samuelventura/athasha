import React from 'react'

import FileBrowser from "./FileBrowser"

function handleDispatch({ name, args }) {
}

function PageHome() {
  return (<div className="App">
    <FileBrowser
      state={{ files: [], selected: {} }}
      dispatch={handleDispatch} />
  </div>)
}

export default PageHome
