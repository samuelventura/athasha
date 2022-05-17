function download(prefix, data) {
    const ext = "athasha.license.json"
    const json = JSON.stringify(data, null, 2)
    const element = document.createElement('a')
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    const timestamp = now.toISOString().replaceAll("-", "").replaceAll(":", "").replaceAll(".", "")
    element.setAttribute('href', 'data:text/plaincharset=utf-8,' + encodeURIComponent(json))
    element.setAttribute('download', `${prefix}-${timestamp}.${ext}`)
    element.style.display = 'none'
    element.click()
}

export default download
