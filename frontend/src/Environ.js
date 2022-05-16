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

function log(...args) {
    if (logEnabled) {
        console.log(...args)
    }
}

function enableLog(enable) {
    logEnabled = enable
}

function reHost(hostname) {
    const url = new URL(window.location.href)
    url.hostname = hostname
    return `${url}`
}

function getEditorId() {
    if (locurl.pathname !== "/editor.html") return null
    return locurl.searchParams.get("id")
}

window.enableLog = enableLog
window.logOn = () => enableLog(true)
window.logOff = () => enableLog(false)

const exports = { wsURL, wsQuery, getEditorId, enableLog, log, reHost }

export default exports
