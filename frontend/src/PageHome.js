import React from 'react'

import ItemBrowser from "./ItemBrowser"

function handleDispatch({ name, args }) {
}

function PageHome() {
  return (<div className="App">
    <ItemBrowser
      state={{ files: [], selected: {} }}
      dispatch={handleDispatch} />
  </div>)
}

export default PageHome
