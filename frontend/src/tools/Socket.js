import Router from "./Router"
import Log from "./Log"

// requirements
// - no sense to implement a connection timeout
// - incremental reconnect timer
// - 10s idle timeout
function create(app) {
    return createSocket(Router.wsURL, Router.wsQuery, app)
}

function createSocket(base, query, { path, dispatch }) {
    let ws = null
    let reco_ms = 0
    let reco = null
    let idle = null
    let conn = null
    let closed = true
    let disposed = false
    const idle_ms = 10000

    function safe(action) {
        try { action() }
        catch (e) { Log.log("exception", e) }
    }

    function send(msg) {
        Log.log("ws.send", disposed, closed, msg)
        if (disposed) return
        if (closed) return
        safe(() => ws.send(JSON.stringify(msg)))
    }

    function dispose() {
        Log.log("dispose", disposed, closed, reco, idle, conn, ws)
        disposed = true
        if (reco) { clearTimeout(reco); reco = null }
        if (idle) { clearTimeout(idle); idle = null }
        if (conn) { clearTimeout(conn); conn = null }
        if (ws) safe(() => ws.close())
    }

    function close() {
        Log.log("close", disposed, closed, reco, idle, ws)
        if (ws) safe(() => ws.close())
        clear_conn()
    }

    function stop_idle() {
        if (idle) { clearTimeout(idle); idle = null }
    }

    function reset_idle() {
        if (idle) { clearTimeout(idle); idle = null }
        idle = setTimeout(close, idle_ms)
    }

    function clear_conn() {
        if (conn) { clearTimeout(conn); conn = null }
    }

    function reset_reco() {
        if (reco) { clearTimeout(reco); reco = null }
        reco = setTimeout(connect, reco_ms)
    }

    function connect() {
        let url = base + path + "/websocket" + query
        ws = new WebSocket(url)
        Log.log("connect", reco, url, ws)
        conn = setTimeout(close, 4000)
        ws.onclose = (event) => {
            Log.log("ws.close", event)
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
            Log.log("ws.message", msg)
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
            Log.log("ws.error", event)
            clear_conn()
        }
        ws.onopen = (event) => {
            Log.log("ws.open", event)
            closed = false
            reco_ms = 1000
            reset_idle()
            clear_conn()
            dispatch({ name: "open", args: send })
        }
    }
    reco = setTimeout(connect, 0)
    return dispose
}

function send(msg) {
    Log.log("nop.send", msg)
}

var exports = { create, send }

export default exports