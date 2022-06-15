import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { FormEntry } from './Tools'
import Initial from "../schemas/Image.js"
import Check from '../common/Check'
import Files from '../tools/Files'
import Clipboard from '../tools/Clipboard'
import Control from "../common/Control"

const $control = Control.Image
const $schema = $control.schema()

const parser = new DOMParser()

function Editor({ getControl, setProp, globals }) {
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    const control = getControl()
    const data = control.data
    const valid = !!data.filename
    function fieldProps(prop, checkbox) {
        function setter(name) {
            return function (value) {
                setProp(name, value)
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $schema[prop], prop)
        args.getter = () => getControl().data[prop]
        args.setter = setter(prop)
        args.checkbox = checkbox
        return Check.props(args)
    }
    const scaleOptions = Initial.scales.map(v => <option key={v} value={v}>{v}</option>)
    const alignOptions = Initial.aligns.map(v => <option key={v} value={v}>{v}</option>)
    //svg must have viewBox but not width/height just 
    //like svgs exported from google slide
    function onUpload() {
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
                setProp("content", svg)
                setProp("filename", fn)
                setProp("viewBox", vb)
            }
        })
    }
    function onDownload() {
        if (!valid) return
        const fn = data.filename
        const dot = fn.lastIndexOf('.')
        const name = fn.slice(0, dot)
        const ext = fn.slice(dot + 1)
        Files.downloadText(data.content, name, ext)
    }
    function onCopy() {
        if (!valid) return
        Clipboard.copyText(data.content)
    }
    return (
        <>
            <Button variant="link" onClick={onUpload}
                title="Select SVG file to upload">Upload...</Button>
            <Button variant="link" onClick={onDownload} disabled={!valid}
                title={data.filename}>Download</Button>
            <Button variant="link" onClick={onCopy} disabled={!valid}
                title="Copy SVG Text to Clipboard">Copy</Button>
            <FormEntry label={$schema.scale.label}>
                <Form.Select {...fieldProps("scale")}>
                    {scaleOptions}
                </Form.Select>
            </FormEntry>
            <FormEntry label={$schema.align.label}>
                <Form.Select {...fieldProps("align")}>
                    {alignOptions}
                </Form.Select>
            </FormEntry>
        </>
    )
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

function Renderer({ control, size, click }) {
    const data = control.data
    const valid = !!data.viewBox
    const aspect = aspectRatio(data.scale, data.align)
    const svg = valid ? data.content : "<svg viewBox='0 0 100 100'></svg>"
    const vb = valid ? data.viewBox : '0 0 100 100'
    const clickBack = click ? <rect width={size.width} height={size.height} fill="white" fillOpacity="0" /> : null
    return (
        <svg>
            {clickBack}
            <svg dangerouslySetInnerHTML={{ __html: svg }}
                preserveAspectRatio={aspect} viewBox={vb}>
            </svg>
        </svg>
    )
}

const Label = { $control, Editor, Renderer }

export default Label
