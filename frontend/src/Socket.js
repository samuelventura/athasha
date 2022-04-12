import Environ from "./Environ"

// requirements
// - no sense to implement a connection timeout
// - incremental reconnect timer
// - 10s idle timeout
function create(app) {
    return createSocket(Environ.wsURL, app)
}

function createSocket(base, { path, dispatch }) {
    let ws = null
    let reco_ms = 0
    let reco = null
    let idle = null
    let closed = true
    let disposed = false
    const idle_ms = 10000

    function safe(action) {
        try { action() }
        catch (e) { Environ.log("exception", e) }
    }

    function send(msg) {
        Environ.log("ws.send", disposed, closed, msg)
        if (disposed) return
        if (closed) return
        safe(() => ws.send(JSON.stringify(msg)))
    }

    function dispose() {
        Environ.log("dispose", disposed, closed, reco, idle, ws)
        disposed = true
        if (reco) { clearTimeout(reco); reco = null }
        if (idle) { clearTimeout(idle); idle = null }
        if (ws) safe(() => ws.close())
    }

    function close() {
        Environ.log("close", disposed, closed, reco, idle, ws)
        if (ws) safe(() => ws.close())
    }

    function stop_idle() {
        if (idle) { clearTimeout(idle); idle = null }
    }

    function reset_idle() {
        if (idle) { clearTimeout(idle); idle = null }
        idle = setTimeout(close, idle_ms)
    }

    function reset_reco() {
        if (reco) { clearTimeout(reco); reco = null }
        reco = setTimeout(connect, reco_ms)
    }

    function connect() {
        let url = base + path + "/websocket"
        ws = new WebSocket(url)
        Environ.log("connect", reco, url, ws)
        ws.onclose = (event) => {
            Environ.log("ws.close", event)
            closed = true
            stop_idle()
            if (disposed) return
            dispatch({ name: "close" })
            reset_reco()
            reco_ms += 1000
            reco_ms %= 4000
        }
        ws.onmessage = (event) => {
            reset_idle()
            const msg = JSON.parse(event.data)
            Environ.log("ws.message", msg)
            switch (msg.name) {
                case "ping":
                    send({ name: "pong" })
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
            reco_ms = 1000
            reset_idle()
            dispatch({ name: "open", args: send })
        }
    }
    reco = setTimeout(connect, 0)
    return dispose
}

function send(msg) {
    Environ.log("nop.send", msg)
}

var exports = { create, send }

export default exports