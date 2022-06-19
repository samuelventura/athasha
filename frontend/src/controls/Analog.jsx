import React from 'react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { FormEntry } from './Tools'
import Control from "../common/Control"
import Check from '../common/Check'

const $control = Control.Analog
const $schema = $control.schema()

function Editor({ getControl, setProp, globals }) {
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    const control = getControl()
    const data = control.data
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
    const circular = data.orientation === "Circular"
    const circularProps = circular ? <>
        <FormEntry label="Arc Config">
            <InputGroup>
                <Form.Control type="number" {...fieldProps("arcZero")} min="-180" max="180" />
                <Form.Control type="number" {...fieldProps("arcSpan")} min="0" max="360" />
                <Form.Control type="number" {...fieldProps("arcWidth")} min="0" max="1" step="0.1" />
            </InputGroup>
        </FormEntry>
    </> : null

    const orientationOptions = $control.orientations.map(v => <option key={v} value={v}>{v}</option>)

    return (
        <>
            <FormEntry label={$schema.orientation.label}>
                <Form.Select {...fieldProps("orientation")}>
                    {orientationOptions}
                </Form.Select>
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
            {circularProps}
            <FormEntry label={$schema.barColor.label}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("barColored", true)} />
                    <Form.Control type="color" {...fieldProps("barColor")} />
                    <Form.Control type="text" {...fieldProps("barColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$schema.gridColor.label}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("gridColored", true)} />
                    <Form.Control type="color" {...fieldProps("gridColor")} />
                    <Form.Control type="text" {...fieldProps("gridColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$schema.gridWidth.label}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("gridWidth")} min="1" step="1" />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$schema.criticalColor.label}>
                <InputGroup>
                    <Form.Control type="color" {...fieldProps("criticalColor")} />
                    <Form.Control type="text" {...fieldProps("criticalColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$schema.warningColor.label}>
                <InputGroup>
                    <Form.Control type="color" {...fieldProps("warningColor")} />
                    <Form.Control type="text" {...fieldProps("warningColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$schema.normalColor.label}>
                <InputGroup>
                    <Form.Control type="color" {...fieldProps("normalColor")} />
                    <Form.Control type="text" {...fieldProps("normalColor")} />
                </InputGroup>
            </FormEntry>
        </>
    )
}

function trimValue(input, value) {
    if (value === null) return null
    const min = input.min
    const max = input.max
    if (value < min) return min
    if (value > max) return max
    return value
}

function calcStatus(data, value) {
    if (value === null) return "critical"
    if (value >= data.normalMin && value <= data.normalMax) return "normal"
    if (value >= data.warningMin && value <= data.warningMax) return "warning"
    return "critical"
}

function getMinMax(data, type, trim) {
    const min = Number(data[`${type}Min`])
    const max = Number(data[`${type}Max`])
    const val = { min, max }
    if (trim) {
        if (min < trim.min) val.min = trim.min
        if (max > trim.max) val.max = trim.max
    }
    if (val.max < val.min) val.max = val.min
    val.span = val.max - val.min
    return val
}

function calcColor(data, status) {
    switch (status) {
        case "normal": return data.normalColor
        case "warning": return data.warningColor
        default: return data.criticalColor
    }
}

function f(v) {
    return isFinite(v) && v > 0 ? v : 0
}

function Renderer({ size, control, string, value }) {
    const number = string ? 0 : value
    const data = control.data
    const circular = data.orientation === "Circular"
    const vertical = data.orientation === "Vertical"
    const input = getMinMax(data, "input")
    const trimmed = trimValue(input, number)
    const status = calcStatus(data, trimmed)
    const level = {
        value: trimmed,
        color: calcColor(data, status),
    }
    const warning = getMinMax(data, "warning", input)
    const normal = getMinMax(data, "normal", input)
    const grid = {
        width: Number(data.gridWidth),
        color: data.gridColor,
        colored: data.gridColored,
    }
    if (!circular) {
        const wide = vertical ? "width" : "height"
        const long = vertical ? "height" : "width"
        const width = size[wide]
        input.len = size[long]
        const calcLen = (v) => f(input.len * (v - input.min) / input.span)
        level.len = calcLen(level.value)
        warning.gmin = calcLen(warning.min)
        warning.gmax = calcLen(warning.max)
        normal.gmin = calcLen(normal.min)
        normal.gmax = calcLen(normal.max)
        if (vertical) {
            level.back = <rect x={0} y={0} width={width} height={input.len} fill={data.barColor} />
            level.bar = <rect x={0} y={0} width={width} height={level.len} fill={level.color} />
            const gridLines = <g>
                <line x1={0} x2={width} y1={warning.gmin} y2={warning.gmin} stroke={grid.color} strokeWidth={grid.width} />
                <line x1={0} x2={width} y1={warning.gmax} y2={warning.gmax} stroke={grid.color} strokeWidth={grid.width} />
                <line x1={0} x2={width} y1={normal.gmax} y2={normal.gmax} stroke={grid.color} strokeWidth={grid.width} />
                <line x1={0} x2={width} y1={normal.gmax} y2={normal.gmax} stroke={grid.color} strokeWidth={grid.width} />
            </g>
            const transform = `scale(1, -1) translate(0, -${size.height})`
            return (
                <svg>
                    <g transform={transform}>
                        {data.barColored ? level.back : null}
                        {grid.colored ? gridLines : null}
                        {level.bar}
                    </g>
                </svg>
            )
        } else {
            level.back = <rect y={0} x={0} height={width} width={input.len} fill={data.barColor} />
            level.bar = <rect y={0} x={0} height={width} width={level.len} fill={level.color} />
            const gridLines = <g>
                <line y1={0} y2={width} x1={warning.gmin} x2={warning.gmin} stroke={grid.color} strokeWidth={grid.width} />
                <line y1={0} y2={width} x1={warning.gmax} x2={warning.gmax} stroke={grid.color} strokeWidth={grid.width} />
                <line y1={0} y2={width} x1={normal.gmax} x2={normal.gmax} stroke={grid.color} strokeWidth={grid.width} />
                <line y1={0} y2={width} x1={normal.gmax} x2={normal.gmax} stroke={grid.color} strokeWidth={grid.width} />
            </g>
            return (
                <svg>
                    {data.barColored ? level.back : null}
                    {grid.colored ? gridLines : null}
                    {level.bar}
                </svg>
            )
        }
    } else {
        const arc = {
            width: Number(data.arcWidth),
            zero: Number(data.arcZero),
            span: Number(data.arcSpan),
        }
        const center = { cx: size.width / 2, cy: size.height / 2 }
        //ensure radious wont go negative
        center.radius = Math.min(center.cx, center.cy)
        const width = center.radius * arc.width
        const radius = center.radius - width / 2
        const calcAngle = (v) => (v - input.min) * arc.span / input.span
        const calcRadians = (v) => Math.PI * calcAngle(v) / 180
        const calcArcSpan = (d) => radius * Math.PI * d / 180
        const calcArcIni = (v) => calcArcSpan(calcAngle(v))
        const perimeter = calcArcSpan(360)
        input.arc = calcArcSpan(arc.span)
        input.dash = `${input.arc} ${perimeter}`
        level.back = <circle r={radius} cx={center.cx} cy={center.cy} fill="none"
            strokeWidth={width} stroke={data.barColor} strokeDasharray={input.dash} />
        level.ini = calcArcIni(level.value)
        level.dash = `${level.ini} ${perimeter}`
        level.bar = <circle r={radius} cx={center.cx} cy={center.cy} fill="none"
            strokeWidth={width} stroke={level.color} strokeDasharray={level.dash} />
        const rotate = `rotate(${arc.zero + 180}, ${center.cx}, ${center.cy})`
        warning.amin = arc.zero + calcRadians(warning.min)
        warning.amax = arc.zero + calcRadians(warning.max)
        normal.amin = arc.zero + calcRadians(normal.min)
        normal.amax = arc.zero + calcRadians(normal.max)
        warning.x2min = center.cx + center.radius * Math.cos(warning.amin)
        warning.y2min = center.cy + center.radius * Math.sin(warning.amin)
        warning.x2max = center.cx + center.radius * Math.cos(warning.amax)
        warning.y2max = center.cy + center.radius * Math.sin(warning.amax)
        normal.x2min = center.cx + center.radius * Math.cos(normal.amin)
        normal.y2min = center.cy + center.radius * Math.sin(normal.amin)
        normal.x2max = center.cx + center.radius * Math.cos(normal.amax)
        normal.y2max = center.cy + center.radius * Math.sin(normal.amax)
        const maskid = `mask-${control.id}`
        const maskurl = `url(#${maskid})`
        const gridLines = <g mask={maskurl}>
            <line x1={center.cx} y1={center.cy} x2={warning.x2min} y2={warning.y2min} stroke={grid.color} strokeWidth={grid.width} />
            <line x1={center.cx} y1={center.cy} x2={warning.x2max} y2={warning.y2max} stroke={grid.color} strokeWidth={grid.width} />
            <line x1={center.cx} y1={center.cy} x2={normal.x2min} y2={normal.y2min} stroke={grid.color} strokeWidth={grid.width} />
            <line x1={center.cx} y1={center.cy} x2={normal.x2max} y2={normal.y2max} stroke={grid.color} strokeWidth={grid.width} />
        </g>
        return <>
            <svg>
                <mask id={maskid}>
                    <circle r={radius} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={width} stroke="white" strokeDasharray={input.dash} />
                    <circle r={center.radius - width} cx={center.cx} cy={center.cy} fill="black" />
                </mask>
                <g transform={rotate}>
                    {data.barColored ? level.back : null}
                    {grid.colored ? gridLines : null}
                    {level.bar}
                </g>
            </svg>
        </>
    }
}

const exports = { $control, Editor, Renderer }

export default exports
