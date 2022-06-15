import React from 'react'
import Files from '../tools/Files'
import Clipboard from '../tools/Clipboard'

const parser = new DOMParser()

//svg must have viewBox but not width/height just 
//like svgs exported from google slide
function onUpload(callback) {
    Files.uploadText("svg", (txt, fn) => {
        const doc = parser.parseFromString(txt, "image/svg+xml")
        const hvb = doc.documentElement.hasAttribute("viewBox")
        //some svgs have width/height trailed with units like mm/px/...
        //parseFloat returns NaN for "", null, and undefined
        const w = parseFloat(doc.documentElement.getAttribute("width"))
        const h = parseFloat(doc.documentElement.getAttribute("height"))
        doc.documentElement.removeAttribute("width")
        doc.documentElement.removeAttribute("height")
        if (!hvb && isFinite(w) && isFinite(h)) {
            doc.documentElement.setAttribute("viewBox", `0 0 ${w} ${h}`)
        }
        const vb = doc.documentElement.getAttribute("viewBox")
        if (vb) {
            const svg = (new XMLSerializer()).serializeToString(doc)
            callback({ svg, fn, vb })
        }
    })
}

function onDownload(data) {
    const valid = !!data.viewBox
    if (!valid) return
    const fn = data.filename
    const dot = fn.lastIndexOf('.')
    const name = fn.slice(0, dot)
    const ext = fn.slice(dot + 1)
    Files.downloadText(data.content, name, ext)
}

function onCopy(data) {
    const valid = !!data.viewBox
    if (!valid) return
    Clipboard.copyText(data.content)
}

function aspectRatio(scale, align) {
    switch (scale) {
        case "Fit": {
            switch (align) {
                case "Center": return "xMidYMid meet"
                case "Start": return "xMinYMin meet"
                case "End": return "xMaxYMax meet"
            }
            break
        }
        case "Stretch": {
            return "none"
        }
    }
}

function render(data) {
    const valid = !!data.viewBox
    const aspect = aspectRatio(data.scale, data.align)
    const svg = valid ? data.content : "<svg viewBox='0 0 100 100'></svg>"
    const vb = valid ? data.viewBox : '0 0 100 100'
    return (
        <svg dangerouslySetInnerHTML={{ __html: svg }}
            preserveAspectRatio={aspect} viewBox={vb}>
        </svg>
    )
}

export default {
    onDownload,
    onUpload,
    onCopy,
    render,
}
