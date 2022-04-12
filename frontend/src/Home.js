import React, { useEffect, useReducer } from 'react'
import Browser from "./items/Browser"
import Socket from "./Socket"
import Environ from "./Environ"

function Home() {

  function initial() {
    return {
      items: {},
      login: false,
      selected: {},
      session: null,
      send: Socket.send
    }
  }

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
        return initial()
      }
      case "open": {
        const next = Object.assign({}, state)
        next.send = args
        return next
      }
      case "login": {
        const next = Object.assign({}, state)
        next.login = true
        return next
      }
      case "session": {
        const next = Object.assign({}, state)
        next.login = false
        next.session = args
        return next
      }
      default:
        Environ.log("Unknown mutation", name, args, session)
        return state
    }
  }

  const [state, dispatch] = useReducer(reducer, initial())

  function upDispatch({ name, args }) {
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
        Environ.log("unknown mutation", name, args)
    }
  }

  useEffect(() => {
    return Socket.create(dispatch, "items")
  }, [])

  return (<div>
    <Browser
      state={state}
      dispatch={upDispatch} />
  </div>)
}

export default Home
