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

function getEditorData() {
    if (locurl.pathname !== "/editor.html") return {}
    const id = locurl.searchParams.get("id")
    return JSON.parse(atob(id))
}

const exports = { wsURL, wsQuery, getEditorData, isViews, reHost }

export default exports
