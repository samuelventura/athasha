import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { FormEntry } from './Tools'
import Initial from "../schemas/Image.js"
import Check from '../common/Check'
import Control from "../common/Control"
import Svg from "../common/Svg"

const $control = Control.Image
const $schema = $control.schema()

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
    const onUpload = () => Svg.onUpload(({ svg, fn, vb }) => {
        setProp("content", svg)
        setProp("filename", fn)
        setProp("viewBox", vb)
    })
    const onDownload = () => Svg.onDownload(data)
    const onClear = () => {
        setProp("content", "")
        setProp("filename", "")
        setProp("viewBox", "")
    }
    return (
        <>
            <Button variant="link" onClick={onUpload}
                title="Select SVG file to upload">Upload...</Button>
            <Button variant="link" onClick={onDownload} disabled={!valid}
                title={data.filename}>Download</Button>
            <Button variant="link" onClick={onClear} disabled={!valid}
                title="Remove background">Clear</Button>
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

function Renderer({ control, size, click }) {
    const data = control.data
    const image = Svg.render(data)
    const clickBack = click ? <rect width={size.width} height={size.height} fill="white" fillOpacity="0" /> : null
    return (
        <svg>
            {clickBack}
            {image}
        </svg>
    )
}

const exports = { $control, Editor, Renderer }

export default exports
