
function downloadJson(data, prefix, ext) {
    const json = JSON.stringify(data, null, 2)
    downloadText(json, prefix, ext)
}

function downloadText(data, prefix, ext) {
    const element = document.createElement('a')
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    const filename = now.toISOString().replaceAll("-", "").replaceAll(":", "").replaceAll(".", "")
    element.setAttribute('href', 'data:text/plaincharset=utf-8,' + encodeURIComponent(data))
    element.setAttribute('download', `${prefix}-${filename}.${ext}`)
    element.style.display = 'none'
    element.click()
}

function uploadJson(ext, callback) {
    uploadText(ext, (txt, file) => {
        callback(JSON.parse(txt), file)
    })
}

function uploadText(ext, callback) {
    uploadB64(ext, (base64, file) => {
        const text = atob(base64)
        callback(text, file)
    })
}

function uploadB64(ext, callback) {
    const input = document.createElement('input')
    input.setAttribute('accept', `.${ext}`)
    input.type = 'file'
    input.onchange = () => {
        const files = Array.from(input.files)
        const reader = new FileReader()
        reader.addEventListener('load', (event) => {
            const uri = event.target.result
            //data:application/jsonbase64,XXXXX....
            const base64 = uri.substring(uri.indexOf(",") + 1)
            callback(base64, files[0].name)
        })
        reader.readAsDataURL(files[0])
    }
    input.click()
}

const licenseExtension = "athasha.license.json"
const backupExtension = "athasha.backup.json"

export default {
    licenseExtension,
    backupExtension,
    downloadText,
    downloadJson,
    uploadJson,
    uploadText,
    uploadB64,
}
