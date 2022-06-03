import React from 'react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { FormEntry } from './Tools'
import "../fonts/Fonts.css"
import "../fonts/Fonts"
import Initial from "./Analog.js"
import Check from '../common/Check'

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
    const customProps = data.style === "Custom" ? <>
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
        <FormEntry label={Initial.dlabels.cursorColor}>
            <InputGroup>
                <Form.Control type="color" {...fieldProps("cursorColor")} />
                <Form.Control type="text" {...fieldProps("cursorColor")} />
            </InputGroup>
        </FormEntry>
    </> : null
    const circularProps = data.orientation === "Circular" ? <>
        <FormEntry label={Initial.dlabels.barRange}>
            <InputGroup>
                <Form.Control type="number" {...fieldProps("barZero")} min="-180" max="180" />
                <Form.Control type="number" {...fieldProps("barSpan")} min="0" max="360" />
                <Form.Control type="number" {...fieldProps("barWidth")} min="0" />
            </InputGroup>
        </FormEntry>
    </> : null

    const orientationOptions = Initial.orientations.map(v => <option key={v} value={v}>{v}</option>)
    const styleOptions = Initial.styles.map(v => <option key={v} value={v}>{v}</option>)

    return (
        <>
            <FormEntry label={Initial.dlabels.orientation}>
                <Form.Select {...fieldProps("orientation")}>
                    {orientationOptions}
                </Form.Select>
            </FormEntry>
            <FormEntry label={Initial.dlabels.style}>
                <Form.Select {...fieldProps("style")}>
                    {styleOptions}
                </Form.Select>
            </FormEntry>
            <FormEntry label={Initial.dlabels.inputRange}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("inputMin")} />
                    <Form.Control type="number" {...fieldProps("inputMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.warningRange}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("warningMin")} />
                    <Form.Control type="number" {...fieldProps("warningMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.normalRange}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("normalMin")} />
                    <Form.Control type="number" {...fieldProps("normalMax")} />
                </InputGroup>
            </FormEntry>
            {circularProps}
            {customProps}
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

function backColors(standard, data) {
    return {
        normal: standard ? "#b7d7e8" : data.normalColor,
        warning: standard ? "#87bdd8" : data.warningColor,
        critical: standard ? "#667292" : data.criticalColor,
    }
}

function foreColors(standard, data) {
    return {
        cursor: standard ? "black" : data.cursorColor,
        normal: standard ? "none" : data.normalColor,
        warning: standard ? "#FF9436" : data.warningColor,
        critical: standard ? "#FC342A" : data.criticalColor,
    }
}

function calcAlertColor(status, fgColors) {
    switch (status) {
        case "normal": return "none"
        case "warning": return fgColors.warning
        default: return fgColors.critical
    }
}

function calcLevelColor(status, fgColors) {
    switch (status) {
        case "normal": return fgColors.normal
        case "warning": return fgColors.warning
        default: return fgColors.critical
    }
}

function f(v) {
    return isFinite(v) && v > 0 ? v : 0
}

function Renderer({ size, control, value }) {
    const data = control.data
    const circular = data.orientation === "Circular"
    const vertical = data.orientation === "Vertical"
    const standard = data.style === "Standard"
    const opacity = standard ? "1.0" : "0.2"
    const input = getMinMax(data, "input")
    const warning = getMinMax(data, "warning", input)
    const normal = getMinMax(data, "normal", input)
    const trimmed = trimValue(input, value)
    const status = calcStatus(data, trimmed)
    const bgColors = backColors(standard, data)
    const fgColors = foreColors(standard, data)
    const level = {
        ratio: 0.4,
        width: 2,
        value: trimmed,
        color: calcLevelColor(status, fgColors),
    }
    const alert = {
        color: calcAlertColor(status, fgColors),
    }
    input.id = `input-${control.id}`
    warning.id = `warning-${control.id}`
    input.mask = standard ? "" : `url(#${input.id})`
    warning.mask = standard ? "" : `url(#${warning.id})`
    if (!circular) {
        const wide = vertical ? "width" : "height"
        const long = vertical ? "height" : "width"
        const width = size[wide]
        input.len = f(size[long] - (standard ? width : 0))
        warning.ini = f(input.len * (warning.min - input.min) / input.span)
        warning.len = f(input.len * warning.span / input.span)
        normal.ini = f(input.len * (normal.min - input.min) / input.span)
        normal.len = f(input.len * normal.span / input.span)
        level.len = f(input.len * (level.value - input.min) / input.span)
        if (vertical) {
            level.cursor = <line x1={0} y1={level.len} x2={width} y2={level.len}
                stroke={fgColors.cursor} strokeWidth={level.width} />
            level.bar = <rect x={width * (1 - level.ratio) / 2} y={0}
                width={width * level.ratio} height={level.len} fill={level.color} />
            alert.path = `M 0 0 L ${width / 2} ${width} L ${width} 0 Z`
            alert.trans = `translate(0, ${input.len})`
            alert.elem = <g transform={alert.trans}>
                <path d={alert.path} stroke="none" fill={alert.color} />
            </g>
            const transform = `scale(1, -1) translate(0, -${size.height})`
            return (
                <svg>
                    <mask id={input.id}>
                        <rect x={0} y={0} width={width} height={input.len} fill="white" />
                        <rect x={0} y={warning.ini} width={width} height={warning.len} fill="black" />
                        <rect x={0} y={normal.ini} width={width} height={normal.len} fill="black" />
                    </mask>
                    <mask id={warning.id}>
                        <rect x={0} y={warning.ini} width={width} height={warning.len} fill="white" />
                        <rect x={0} y={normal.ini} width={width} height={normal.len} fill="black" />
                    </mask>
                    <g transform={transform}>
                        <rect x={0} y={0} width={width} height={input.len}
                            fill={bgColors.critical} fillOpacity={opacity} mask={input.mask} />
                        <rect x={0} y={warning.ini} width={width} height={warning.len}
                            fill={bgColors.warning} fillOpacity={opacity} mask={warning.mask} />
                        <rect x={0} y={normal.ini} width={width} height={normal.len}
                            fill={bgColors.normal} fillOpacity={opacity} />
                        {standard ? alert.elem : null}
                        {standard ? level.cursor : level.bar}
                    </g>
                </svg>
            )
        } else {
            level.cursor = <line y1={0} x1={level.len} y2={width} x2={level.len}
                stroke={fgColors.cursor} strokeWidth={level.width} />
            level.bar = <rect y={width * (1 - level.ratio) / 2} x={0}
                height={width * level.ratio} width={level.len} fill={level.color} />
            alert.path = `M 0 0 L 0 ${width} L ${width} ${width / 2} Z`
            alert.trans = `translate(${input.len}, 0)`
            alert.elem = <g transform={alert.trans}>
                <path d={alert.path} stroke="none" fill={alert.color} />
            </g>
            return (
                <svg>
                    <mask id={input.id}>
                        <rect y={0} x={0} height={width} width={input.len} fill="white" />
                        <rect y={0} x={warning.ini} height={width} width={warning.len} fill="black" />
                        <rect y={0} x={normal.ini} height={width} width={normal.len} fill="black" />
                    </mask>
                    <mask id={warning.id}>
                        <rect y={0} x={warning.ini} height={width} width={warning.len} fill="white" />
                        <rect y={0} x={normal.ini} height={width} width={normal.len} fill="black" />
                    </mask>
                    <rect y={0} x={0} height={width} width={input.len}
                        fill={bgColors.critical} fillOpacity={opacity} mask={input.mask} />
                    <rect y={0} x={warning.ini} height={width} width={warning.len}
                        fill={bgColors.warning} fillOpacity={opacity} mask={warning.mask} />
                    <rect y={0} x={normal.ini} height={width} width={normal.len}
                        fill={bgColors.normal} fillOpacity={opacity} />
                    {standard ? alert.elem : null}
                    {standard ? level.cursor : level.bar}
                </svg>
            )
        }
    } else {
        const bar = {
            width: Number(data.barWidth),
            zero: Number(data.barZero),
            span: Number(data.barSpan),
        }
        const center = { cx: size.width / 2, cy: size.height / 2 }
        const radius = f(Math.min(center.cx, center.cy) - bar.width / 2)
        const arc = (d) => radius * Math.PI * d / 180
        const ini = (v) => arc(f((v - input.min) * bar.span / input.span))
        const perimeter = arc(360)
        input.arc = arc(bar.span)
        input.dash = `${input.arc} ${perimeter}`
        warning.arc = arc(warning.span * bar.span / input.span)
        warning.ini = ini(warning.min)
        warning.dash = `0 ${warning.ini} ${warning.arc} ${perimeter}`
        normal.arc = arc(normal.span * bar.span / input.span)
        normal.ini = ini(normal.min)
        normal.dash = `0 ${normal.ini} ${normal.arc} ${perimeter}`
        level.ini = ini(level.value)
        level.dash = `0 ${level.ini - level.width / 2} ${level.width} ${perimeter}`
        level.cursor = <circle r={radius} cx={center.cx} cy={center.cy} fill="none"
            strokeWidth={bar.width} stroke={fgColors.cursor} strokeDasharray={level.dash} />
        level.dash = `${level.ini} ${perimeter}`
        level.bar = <circle r={radius} cx={center.cx} cy={center.cy} fill="none"
            strokeWidth={bar.width * level.ratio} stroke={level.color} strokeDasharray={level.dash} />
        const rotate = `rotate(${bar.zero + 180}, ${center.cx}, ${center.cy})`
        alert.radius = f(radius - bar.width / 2)
        alert.arc = alert.radius * Math.PI * bar.span / 180
        alert.dash = `${alert.arc}  ${perimeter}`
        alert.elem = standard ? <circle r={alert.radius} cx={center.cx} cy={center.cy} fill="none"
            strokeWidth={bar.width} stroke={alert.color} strokeDasharray={alert.dash} /> : null
        return <>
            <svg>
                <mask id={input.id}>
                    <circle r={radius} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={bar.width} stroke="white" strokeDasharray={input.dash} />
                    <circle r={radius} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={bar.width} stroke="black" strokeDasharray={warning.dash} />
                    <circle r={radius} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={bar.width} stroke="black" strokeDasharray={normal.dash} />
                </mask>
                <mask id={warning.id}>
                    <circle r={radius} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={bar.width} stroke="white" strokeDasharray={warning.dash} />
                    <circle r={radius} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={bar.width} stroke="black" strokeDasharray={normal.dash} />
                </mask>
                <g transform={rotate}>
                    {alert.elem}
                    <circle r={radius} cx={center.cx} cy={center.cy} fill="none" strokeOpacity={opacity}
                        strokeWidth={bar.width} stroke={bgColors.critical} strokeDasharray={input.dash} mask={input.mask} />
                    <circle r={radius} cx={center.cx} cy={center.cy} fill="none" strokeOpacity={opacity}
                        strokeWidth={bar.width} stroke={bgColors.warning} strokeDasharray={warning.dash} mask={warning.mask} />
                    <circle r={radius} cx={center.cx} cy={center.cy} fill="none" strokeOpacity={opacity}
                        strokeWidth={bar.width} stroke={bgColors.normal} strokeDasharray={normal.dash} />
                    {standard ? level.cursor : level.bar}
                </g>
            </svg>
        </>
    }
}

const Type = Initial.type
const Init = Initial.data
const Merge = Initial.merge
const Validate = Initial.validate

const Label = { Type, Init, Editor, Renderer, Validate, Merge }

export default Label
