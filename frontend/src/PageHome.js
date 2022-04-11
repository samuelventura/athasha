import React, { useEffect, useReducer } from 'react'
import ItemBrowser from "./ItemBrowser"
import Socket from "./Socket"
import env from "./Environ"

function PageHome() {
  //reducer must be pure
  function reducer(state, { name, args, session }) {
    switch (name) {
      case "all": {
        const next = Object.assign({}, state)
        next.session = session
        next.items = {}
        args.items.forEach(i => next.items[i.id] = i)
        return next
      }
      case "create": {
        const next = Object.assign({}, state)
        next.items[args.id] = args
        if (next.session === session) {
          next.selected = args
        }
        return next
      }
      case "delete": {
        const next = Object.assign({}, state)
        delete next.items[args.id]
        return next
      }
      case "rename": {
        const next = Object.assign({}, state)
        next.items[args.id].name = args.name
        return next
      }
      case "enable": {
        const next = Object.assign({}, state)
        next.items[args.id].enabled = args.enabled
        return next
      }
      case "select": {
        const next = Object.assign({}, state)
        next.selected = args
        return next
      }
      case "close": {
        //flickers on navigating back (reconnect)
        const next = Object.assign({}, state)
        next.items = {}
        next.selected = {}
        next.session = null
        return next
      }
      case "send": {
        const next = Object.assign({}, state)
        next.send = args
        return next
      }
      default:
        env.log("Unknown mutation", name, args, session)
        return state
    }
  }

  const initial = {
    items: {},
    selected: {},
    session: null,
    send: Socket.send
  }

  const [state, dispatch] = useReducer(reducer, initial)

  function handleDispatch({ name, args }) {
    switch (name) {
      case "select":
        dispatch({ name, args })
        break
      case "create":
      case "delete":
      case "rename":
      case "enable":
        state.send({ name, args })
        break
      default:
        env.log("Unknown mutation", name, args)
    }
  }

  useEffect(() => {
    return Socket.create(dispatch, "items/websocket")
  }, [])

  return (<div className="PageHome">
    <ItemBrowser
      state={state}
      dispatch={handleDispatch} />
  </div>)
}

export default PageHome
