import Environ from "./Environ"
import Session from "./Session"

function create(dispatch, path) {
    return createSocket(dispatch, path, Environ.wsURL)
}

function createSocket(dispatch, path, base) {
    let toms = 0
    let to = null
    let ws = null
    let closed = true
    let disposed = false

    function safe(action) {
        try { action() }
        catch (e) { Environ.log("exception", e) }
    }

    function dispose() {
        Environ.log("dispose", disposed, closed, to, ws)
        disposed = true
        if (to) clearTimeout(to)
        if (ws) safe(() => ws.close())
    }

    function send(msg) {
        Environ.log("ws.send", disposed, closed, msg)
        if (disposed) return
        if (closed) return
        safe(() => ws.send(JSON.stringify(msg)))
    }

    function connect() {
        //immediate error when navigating back
        //toms is workaround for trottled reconnection
        //safari only, chrome and firefox work ok
        let url = base + path + "/websocket"
        ws = new WebSocket(url)
        Environ.log("connect", to, url, ws)
        ws.onclose = (event) => {
            Environ.log("ws.close", event)
            closed = true
            if (disposed) return
            dispatch({ name: "close" })
            to = setTimeout(connect, toms)
            toms += 1000
            toms %= 4000
        }
        ws.onmessage = (event) => {
            //FIXME close if silent for 10sec
            //Environ.log("ws.message", event, event.data)
            const msg = JSON.parse(event.data)
            Environ.log("ws.message", msg)
            switch (msg.name) {
                case "ping":
                    send({ name: "pong" })
                    break
                case "login":
                    Session.remove(path)
                    dispatch(msg)
                    break
                case "session":
                    break
                default:
                    dispatch(msg)
                    break
            }
        }
        ws.onerror = (event) => {
            Environ.log("ws.error", event)
        }
        ws.onopen = (event) => {
            Environ.log("ws.open", event)
            closed = false
            toms = 1000
            dispatch({ name: "open", args: send })
            send({ ...Session.fetch(path), name: "session" })
        }
    }
    to = setTimeout(connect, 0)
    return dispose
}

function send(msg) {
    Environ.log("nop.send", msg)
}

var exports = { create, send }

export default exports