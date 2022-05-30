// LOG

const enabled = {
    log: import.meta.env.DEV,
    react: import.meta.env.DEV,
}

function createLog(name) {
    return function log(...args) {
        if (enabled[name]) {
            const now = new Date().toISOString()
            const ts = now.substring(14, 23)
            console.log(ts, ...args)
        }
    }
}

function enableLog(name) {
    enabled[name] = true
}

function disableLog(name) {
    enabled[name] = false
}

window.logOn = (name) => enableLog(name || "log")
window.logOff = (name) => disableLog(name || "log")


const log = createLog("log")
const react = createLog("react")

// EXPORTS
const exports = { log, react }

export default exports
