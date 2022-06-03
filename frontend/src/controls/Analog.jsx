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

function calcDisplay(standard, size, long, thick) {
    return size[long] - (standard ? size[thick] : 0)
}

function getMinMax(data, type, trim) {
    const min = Number(data[`${type}Min`])
    const max = Number(data[`${type}Max`])
    const val = { min, max }
    if (trim) {
        if (min < trim.min) val.min = trim.min
        if (max < trim.max) val.max = trim.max
    }
    val.span = max - min
    if (val.span < 0) val.span = 0
    return val
}

function calcPos(display, input, value) {
    if (value === null) return null
    return display * (value - input.min) / input.span
}

function calcRange(data, display, input, type) {
    const range = getMinMax(data, type)
    const min = calcPos(display, input, range.min)
    const max = calcPos(display, input, range.max)
    const span = max - min
    return { min, max, span }
}

function getWidth(size, prop) {
    return size[prop]
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
        warning: standard ? "#FCE92A" : data.warningColor,
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

function fnn(v) {
    return v < 0 ? 0 : v
}

// function fnf(v) {
//     return isFinite(v) ? v : 0
// }

function Renderer({ size, control, value }) {
    const data = control.data
    const input = getMinMax(data, "input")
    const cursor = { width: 2, value: trimValue(input, value) }
    const status = calcStatus(data, cursor.value)
    const circular = data.orientation === "Circular"
    const vertical = data.orientation === "Vertical"
    const standard = data.style === "Standard"
    const bgColors = backColors(standard, data)
    const fgColors = foreColors(standard, data)
    const alertColor = calcAlertColor(status, fgColors)
    const levelColor = calcLevelColor(status, fgColors)
    const opacity = standard ? "1.0" : "0.2"
    const level = { ratio: 0.4 }
    const criticalId = `critical-${control.id}`
    const warningId = `warning-${control.id}`
    const criticalMask = standard ? "" : `url(#${criticalId})`
    const warningMask = standard ? "" : `url(#${warningId})`
    if (!circular) {
        const thick = vertical ? "width" : "height"
        const long = vertical ? "height" : "width"
        const width = getWidth(size, thick)
        const display = calcDisplay(standard, size, long, thick)
        level.length = display * (cursor.value - input.min) / input.span
        const warning = calcRange(data, display, input, "warning")
        const normal = calcRange(data, display, input, "normal")
        cursor.arc = calcPos(display, input, cursor.value)
        if (vertical) {
            const standardCursor = cursor.arc !== null ? <>
                <line x1={0} y1={cursor.arc} x2={width} y2={cursor.arc}
                    stroke={fgColors.cursor} strokeWidth={cursor.width} />
            </> : null
            level.cursor = <rect x={width * (1 - level.ratio) / 2} y={0}
                width={fnn(width * level.ratio)} height={fnn(level.length)} fill={levelColor} />
            const alertPath = `M 0 0 L ${width / 2} ${width} L ${width} 0 Z`
            const alertTrans = `translate(0, ${display})`
            const transform = `scale(1, -1) translate(0, -${size.height})`
            const alertElem = standard ? <g transform={alertTrans}>
                <path d={alertPath} stroke="none" fill={alertColor} />
            </g> : null
            return (
                <svg>
                    <mask id={criticalId}>
                        <rect x={0} y={0} width={fnn(width)} height={fnn(display)} fill="white" />
                        <rect x={0} y={warning.min} width={fnn(width)} height={fnn(warning.span)} fill="black" />
                        <rect x={0} y={normal.min} width={fnn(width)} height={fnn(normal.span)} fill="black" />
                    </mask>
                    <mask id={warningId}>
                        <rect x={0} y={warning.min} width={fnn(width)} height={fnn(warning.span)} fill="white" />
                        <rect x={0} y={normal.min} width={fnn(width)} height={fnn(normal.span)} fill="black" />
                    </mask>
                    <g transform={transform}>
                        <rect x={0} y={0} width={fnn(width)} height={fnn(display)}
                            fill={bgColors.critical} fillOpacity={opacity} mask={criticalMask} />
                        <rect x={0} y={warning.min} width={fnn(width)} height={fnn(warning.span)}
                            fill={bgColors.warning} fillOpacity={opacity} mask={warningMask} />
                        <rect x={0} y={normal.min} width={fnn(width)} height={fnn(normal.span)}
                            fill={bgColors.normal} fillOpacity={opacity} />
                        {alertElem}
                        {standard ? standardCursor : level.cursor}
                    </g>
                </svg>
            )
        } else {
            const standardCursor = cursor.arc !== null ? <>
                <line y1={0} x1={cursor.arc} y2={width} x2={cursor.arc}
                    stroke={fgColors.cursor} strokeWidth={cursor.width} />
            </> : null
            level.cursor = <rect y={width * (1 - level.ratio) / 2} x={0}
                height={fnn(width * level.ratio)} width={fnn(level.length)} fill={levelColor} />
            const alertPath = `M 0 0 L 0 ${width} L ${width} ${width / 2} Z`
            const alertTrans = `translate(${display}, 0)`
            const alertElem = standard ? <g transform={alertTrans}>
                <path d={alertPath} stroke="none" fill={alertColor} />
            </g> : null
            return (
                <svg>
                    <mask id={criticalId}>
                        <rect y={0} x={0} height={fnn(width)} width={fnn(display)} fill="white" />
                        <rect y={0} x={warning.min} height={fnn(width)} width={fnn(warning.span)} fill="black" />
                        <rect y={0} x={normal.min} height={fnn(width)} width={fnn(normal.span)} fill="black" />
                    </mask>
                    <mask id={warningId}>
                        <rect y={0} x={warning.min} height={fnn(width)} width={fnn(warning.span)} fill="white" />
                        <rect y={0} x={normal.min} height={fnn(width)} width={fnn(normal.span)} fill="black" />
                    </mask>
                    <rect y={0} x={0} height={fnn(width)} width={fnn(display)}
                        fill={bgColors.critical} fillOpacity={opacity} mask={criticalMask} />
                    <rect y={0} x={warning.min} height={fnn(width)} width={fnn(warning.span)}
                        fill={bgColors.warning} fillOpacity={opacity} mask={warningMask} />
                    <rect y={0} x={normal.min} height={fnn(width)} width={fnn(normal.span)}
                        fill={bgColors.normal} fillOpacity={opacity} />
                    {alertElem}
                    {standard ? standardCursor : level.cursor}
                </svg>
            )
        }
    } else {
        const bar = {
            width: Number(data.barWidth),
            zero: Number(data.barZero),
            span: Number(data.barSpan),
        }
        const tick = bar.width
        const center = { cx: size.width / 2, cy: size.height / 2 }
        const radius = fnn(Math.min(center.cx, center.cy) - tick / 2)
        const arc = (d) => radius * Number(Math.PI * d / 180)
        const ini = (v) => arc((v - input.min) * bar.span / input.span)
        const perimeter = arc(360)
        const input = getMinMax(data, "input")
        input.arc = arc(bar.span)
        input.dash = `${input.arc}  ${perimeter}`
        const warning = getMinMax(data, "warning", input)
        warning.arc = arc(warning.span * bar.span / input.span)
        warning.ini = ini(warning.min)
        warning.dash = `0 ${warning.ini} ${warning.arc} ${perimeter}`
        const normal = getMinMax(data, "normal", input)
        normal.arc = arc(normal.span * bar.span / input.span)
        normal.ini = ini(normal.min)
        normal.dash = `0 ${normal.ini} ${normal.arc} ${perimeter}`
        cursor.ini = ini(cursor.value)
        cursor.dash = `0 ${cursor.ini} ${cursor.width} ${perimeter}`
        cursor.elem = <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none"
            strokeWidth={tick} stroke={fgColors.cursor} strokeDasharray={cursor.dash} />
        level.dash = `${cursor.ini} ${perimeter}`
        level.elem = <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none"
            strokeWidth={tick * level.ratio} stroke={levelColor} strokeDasharray={level.dash} />
        const rotate = `rotate(${bar.zero + 180}, ${center.cx}, ${center.cy})`
        const alert = { radius: radius - tick / 2 }
        alert.arc = alert.radius * Number(Math.PI * bar.span / 180)
        alert.dash = `${alert.arc}  ${perimeter}`
        alert.elem = standard ? <circle r={fnn(radius - tick / 2)} cx={center.cx} cy={center.cy} fill="none"
            strokeWidth={tick} stroke={alertColor} strokeDasharray={alert.dash} /> : null
        return <>
            <svg>
                <mask id={criticalId}>
                    <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={tick} stroke="white" strokeDasharray={input.dash} />
                    <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={tick} stroke="black" strokeDasharray={warning.dash} />
                    <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={tick} stroke="black" strokeDasharray={normal.dash} />
                </mask>
                <mask id={warningId}>
                    <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={tick} stroke="white" strokeDasharray={warning.dash} />
                    <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={tick} stroke="black" strokeDasharray={normal.dash} />
                </mask>
                <g transform={rotate}>
                    {alert.elem}
                    <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none" strokeOpacity={opacity}
                        strokeWidth={tick} stroke={bgColors.critical} strokeDasharray={input.dash} mask={criticalMask} />
                    <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none" strokeOpacity={opacity}
                        strokeWidth={tick} stroke={bgColors.warning} strokeDasharray={warning.dash} mask={warningMask} />
                    <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none" strokeOpacity={opacity}
                        strokeWidth={tick} stroke={bgColors.normal} strokeDasharray={normal.dash} />
                    {standard ? cursor.elem : level.elem}
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
