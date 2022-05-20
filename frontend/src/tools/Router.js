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

function reHost(hostname) {
    const url = new URL(window.location.href)
    url.hostname = hostname
    return `${url}`
}

function isViews() {
    return (locurl.pathname === "/views.html")
}

function getEditorId() {
    if (locurl.pathname !== "/editor.html") return null
    return locurl.searchParams.get("id")
}

const exports = { wsURL, wsQuery, getEditorId, isViews, reHost }

export default exports
