import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { FormEntry } from './Tools'
import Initial from "./Image.js"
import Check from '../common/Check'
import Files from '../tools/Files'

const parser = new DOMParser()

function Editor({ control, setProp, globals }) {
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    const data = control.data
    function fieldProps(prop) {
        function setter(name) {
            return function (value) {
                setProp(name, value)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.dlabels[prop]
        args.hint = Initial.dhints[prop]
        args.getter = () => data[prop]
        args.setter = setter(prop)
        args.check = Initial.dchecks[prop]
        args.defval = Initial.data()[prop]
        return Check.props(args)
    }
    const scaleOptions = Initial.scales.map(v => <option key={v} value={v}>{v}</option>)
    const alignOptions = Initial.aligns.map(v => <option key={v} value={v}>{v}</option>)
    //svg must have viewBox but not width/height just 
    //like svgs exported from google slide
    function onClick() {
        Files.uploadText("svg", (txt, fn) => {
            const doc = parser.parseFromString(txt, "image/svg+xml")
            const hvb = doc.documentElement.hasAttribute("viewBox")
            const w = doc.documentElement.getAttribute("width")
            const h = doc.documentElement.getAttribute("height")
            doc.documentElement.removeAttribute("width")
            doc.documentElement.removeAttribute("height")
            if (!hvb && w && h) {
                doc.documentElement.setAttribute("viewBox", `0 0 ${w} ${h}`)
            }
            const vb = doc.documentElement.getAttribute("viewBox")
            const svg = (new XMLSerializer()).serializeToString(doc)
            setProp("content", svg)
            setProp("filename", fn)
            setProp("viewBox", vb)
        })
    }
    return (
        <>
            <Button variant="link" onClick={onClick}>Select file...</Button>
            <FormEntry label={Initial.dlabels.scale}>
                <Form.Select {...fieldProps("scale")}>
                    {scaleOptions}
                </Form.Select>
            </FormEntry>
            <FormEntry label={Initial.dlabels.align}>
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

function Renderer({ control }) {
    const data = control.data
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

const Type = Initial.type
const Init = Initial.data
const Merge = Initial.merge

const Label = { Type, Init, Editor, Renderer, Merge }

export default Label
