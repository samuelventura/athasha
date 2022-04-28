const locurl = new URL(window.location.href)
let wsproto = "ws:"
if (locurl.protocol === "https:") {
    wsproto = "wss:"
}
let pathname = locurl.pathname
if (pathname.endsWith(".html")) {
    const pn = pathname
    pathname = pn.substring(0, pn.lastIndexOf('/') + 1)
}
const wsURL = `${wsproto}//${locurl.host}${pathname}`
const wsQuery = locurl.search

let logEnabled = import.meta.env.DEV

window.enableLog = enableLog

function log(...args) {
    if (logEnabled) {
        console.log(...args)
    }
}

function enableLog(enable) {
    logEnabled = enable
}

const exports = { wsURL, wsQuery, enableLog, log }

export default exports
