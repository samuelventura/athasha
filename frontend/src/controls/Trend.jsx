import React from 'react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { FormEntry } from './Tools'
import "../fonts/Fonts.css"
import "../fonts/Fonts"
import Initial from "../schemas/Trend.js"
import Check from '../common/Check'
import Input from "../screen/Input"
import Control from "../common/Control"

const $control = Control.Trend

//to debug this reduce the number of points to 4
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
    const criPoints = reducer(values, "cri")
    const criPaths = criPoints.map((p, i) => <polyline key={i} points={p} fill="none" strokeWidth={data.lineWidth} stroke={data.criticalColor} />)
    const warPoints = reducer(values, "war")
    const warPaths = warPoints.map((p, i) => <polyline key={i} points={p} fill="none" strokeWidth={data.lineWidth} stroke={data.warningColor} />)
    const norPoints = reducer(values, "nor")
    const norPaths = norPoints.map((p, i) => <polyline key={i} points={p} fill="none" strokeWidth={data.lineWidth} stroke={data.normalColor} />)
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
        args.label = Initial.dlabels[prop]
        args.hint = Initial.dhints[prop]
        args.getter = () => getControl().data[prop]
        args.setter = setter(prop)
        args.check = Initial.dchecks[prop]
        args.defval = Initial.data()[prop]
        args.checkbox = checkbox
        return Check.props(args)
    }

    return (
        <>
            <FormEntry label={Initial.dlabels.sample}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("samplePeriod")} min="1" />
                    <Form.Control type="number" {...fieldProps("sampleLength")} min="1" />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.inputRange}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("inputMin")} />
                    <Form.Control type="number" {...fieldProps("inputMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.normalRange}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("normalMin")} />
                    <Form.Control type="number" {...fieldProps("normalMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.warningRange}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("warningMin")} />
                    <Form.Control type="number" {...fieldProps("warningMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.criticalColor}>
                <InputGroup>
                    <Form.Control type="color" {...fieldProps("criticalColor")} />
                    <Form.Control type="text" {...fieldProps("criticalColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.warningColor}>
                <InputGroup>
                    <Form.Control type="color" {...fieldProps("warningColor")} />
                    <Form.Control type="text" {...fieldProps("warningColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.normalColor}>
                <InputGroup>
                    <Form.Control type="color" {...fieldProps("normalColor")} />
                    <Form.Control type="text" {...fieldProps("normalColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.lineWidth}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("lineWidth")} min="1" step="1" />
                    <Form.Control type="number" {...fieldProps("gridWidth")} min="1" step="1" />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.lineColor}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("lineColored", true)} />
                    <Form.Control type="color" {...fieldProps("lineColor")} />
                    <Form.Control type="text" {...fieldProps("lineColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.gridColor}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("gridColored", true)} />
                    <Form.Control type="color" {...fieldProps("gridColor")} />
                    <Form.Control type="text" {...fieldProps("gridColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.backColor}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("backColored", true)} />
                    <Form.Control type="color" {...fieldProps("backColor")} />
                    <Form.Control type="text" {...fieldProps("backColor")} />
                </InputGroup>
            </FormEntry>
        </>
    )
}

const Label = { $control, Editor, Renderer }

export default Label
