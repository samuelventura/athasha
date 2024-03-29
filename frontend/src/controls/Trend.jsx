import React from 'react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { FormEntry } from './Tools'
import Check from '../common/Check'
import Input from "../screen/Input"
import Control from "../common/Control"

const $control = Control.Trend
const $schema = $control.schema()

//to debug this, reduce the number of points to 4
//errors are very clear for small number of points
function Renderer({ control, size, trend }) {
    const data = control.data
    const setts = control.setts
    const config = trend ? trend : {}
    const full = trend ? trend.values : []
    //local length with accumulated period
    const count = Math.trunc(1000 * data.sampleLength / config.period)
    const init = Math.max(0, full.length - count - 1) //one more required
    const xspan = Number(data.sampleLength)
    const ymin = Number(data.inputMin)
    const ymax = Number(data.inputMax)
    const yspan = ymax - ymin
    const nmin = Number(data.normalMin)
    const nmax = Number(data.normalMax)
    const wmin = Number(data.warningMin)
    const wmax = Number(data.warningMax)
    const isNormal = (v) => v >= nmin && v <= nmax
    const isWarning = (v) => v >= wmin && v <= wmax
    const values = full.slice(init, full.length).map(e => {
        const val = Input.scaler(setts, e.val)
        const normal = isNormal(val)
        const warning = isWarning(val)
        return {
            dt: e.dt,
            del: e.del,
            val: val,
            nor: normal ? val : null,
            war: warning && !normal ? val : null,
            cri: !warning && !normal ? val : null,
        }
    })
    function reducer(list, prop) {
        const im = list.length - 1
        const r = list.reduce((p, c, i) => {
            const t = c.del
            const v = c[prop]
            if (v !== null) {
                if (p.b) p.b += ", "
                p.b += `${xpos(t)} ${ypos(v)}`
            }
            if (v === null || i === im) {
                if (p.b) p.s.push(p.b)
                p.b = ""
            }
            return p
        }, { b: "", s: [] })
        return r.s
    }
    const backColor = data.backColored ? data.backColor : "none"
    const lineColor = data.lineColored ? data.lineColor : "none"
    const gridColor = data.gridColored ? data.gridColor : "none"
    function ypos(value) { return size.height * (1 - (value - ymin) / yspan) }
    function xpos(value) { return size.width * (1 - value / xspan) }
    const nminp = ypos(nmin)
    const nmaxp = ypos(nmax)
    const wminp = ypos(wmin)
    const wmaxp = ypos(wmax)
    const valPoints = reducer(values, "val")
    const valPaths = valPoints.map((p, i) => <polyline key={i} points={p} fill="none" strokeWidth={data.lineWidth} stroke={lineColor} />)
    const criPaths = data.criticalColored ? reducer(values, "cri").map((p, i) =>
        <polyline key={i} points={p} fill="none" strokeWidth={data.lineWidth} stroke={data.criticalColor} />) : null
    const warPaths = data.warningColored ? reducer(values, "war").map((p, i) =>
        <polyline key={i} points={p} fill="none" strokeWidth={data.lineWidth} stroke={data.warningColor} />) : null
    const norPaths = data.normalColored ? reducer(values, "nor").map((p, i) =>
        <polyline key={i} points={p} fill="none" strokeWidth={data.lineWidth} stroke={data.normalColor} />) : null
    return <svg>
        <rect width={size.width} height={size.height} fill={backColor}></rect>
        <line x1={0} y1={wminp} x2={size.width} y2={wminp} stroke={gridColor} strokeWidth={data.gridWidth} />
        <line x1={0} y1={wmaxp} x2={size.width} y2={wmaxp} stroke={gridColor} strokeWidth={data.gridWidth} />
        <line x1={0} y1={nminp} x2={size.width} y2={nminp} stroke={gridColor} strokeWidth={data.gridWidth} />
        <line x1={0} y1={nmaxp} x2={size.width} y2={nmaxp} stroke={gridColor} strokeWidth={data.gridWidth} />
        {valPaths}
        {criPaths}
        {warPaths}
        {norPaths}
    </svg>
}

function Editor({ getControl, setProp, globals }) {
    const captured = globals.captured
    const setCaptured = globals.setCaptured
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

    return (
        <>
            <FormEntry label="Sampling">
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("samplePeriod")} min="1" />
                    <Form.Control type="number" {...fieldProps("sampleLength")} min="1" />
                </InputGroup>
            </FormEntry>
            <FormEntry label="Input Range">
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("inputMin")} />
                    <Form.Control type="number" {...fieldProps("inputMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label="Normal Range">
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("normalMin")} />
                    <Form.Control type="number" {...fieldProps("normalMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label="Warning Range">
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("warningMin")} />
                    <Form.Control type="number" {...fieldProps("warningMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$schema.criticalColor.label}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("criticalColored", true)} />
                    <Form.Control type="color" {...fieldProps("criticalColor")} />
                    <Form.Control type="text" {...fieldProps("criticalColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$schema.warningColor.label}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("warningColored", true)} />
                    <Form.Control type="color" {...fieldProps("warningColor")} />
                    <Form.Control type="text" {...fieldProps("warningColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$schema.normalColor.label}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("normalColored", true)} />
                    <Form.Control type="color" {...fieldProps("normalColor")} />
                    <Form.Control type="text" {...fieldProps("normalColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$schema.lineWidth.label}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("lineWidth")} min="1" step="1" />
                    <Form.Control type="number" {...fieldProps("gridWidth")} min="1" step="1" />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$schema.lineColor.label}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("lineColored", true)} />
                    <Form.Control type="color" {...fieldProps("lineColor")} />
                    <Form.Control type="text" {...fieldProps("lineColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$schema.gridColor.label}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("gridColored", true)} />
                    <Form.Control type="color" {...fieldProps("gridColor")} />
                    <Form.Control type="text" {...fieldProps("gridColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$schema.backColor.label}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("backColored", true)} />
                    <Form.Control type="color" {...fieldProps("backColor")} />
                    <Form.Control type="text" {...fieldProps("backColor")} />
                </InputGroup>
            </FormEntry>
        </>
    )
}

const exports = { $control, Editor, Renderer }

export default exports
