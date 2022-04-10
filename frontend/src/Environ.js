const locurl = new URL(window.location.href)
let wsproto = "ws:"
if (locurl.protocol === "https:") {
    wsproto = "wss:"
}
const wsURL = `${wsproto}//${locurl.host}${locurl.pathname}`

let logEnabled = process.env.NODE_ENV === 'development'

window.enableLog = enableLog

function log(...args) {
    if (logEnabled) {
        console.log(...args)
    }
}

function enableLog(enable) {
    logEnabled = enable
}

const exports = { wsURL, enableLog, log }

export default exports
