
let logEnabled = import.meta.env.DEV

function log(...args) {
    if (logEnabled) {
        console.log(...args)
    }
}

function enableLog(enable) {
    logEnabled = enable
}

window.enableLog = enableLog
window.logOn = () => enableLog(true)
window.logOff = () => enableLog(false)

const exports = { log }

export default exports
