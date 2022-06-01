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
    if (value === undefined) return null
    const min = input.min
    const max = input.max
    if (value < min) return min
    if (value > max) return max
    return value
}

function calcStatus(data, value) {
    if (value === null) return "critical"
    if (value === undefined) return "critical"
    if (value >= data.normalMin && value <= data.normalMax) return "normal"
    if (value >= data.warningMin && value <= data.warningMax) return "warning"
    return "critical"
}

function calcDisplay(standard, size, long, thick) {
    return size[long] - (standard ? size[thick] : 0)
}


function getMinMax(data, type) {
    const min = Number(data[`${type}Min`])
    const max = Number(data[`${type}Max`])
    const span = max - min
    return { min, max, span }
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
        warning: standard ? "#FCE92A" : data.warningColor,
        critical: standard ? "#FC342A" : data.criticalColor,
    }
}

function statusColor(status, fgColors) {
    if (status == null) return "none"
    switch (status) {
        case "normal": return "none"
        case "warning": return fgColors.warning
        default: return fgColors.critical
    }
}

function fnn(v) {
    return v < 0 ? 0 : v
}

function Renderer({ size, control, value }) {
    const data = control.data
    const input = getMinMax(data, "input")
    const trimmed = trimValue(input, value)
    const status = calcStatus(data, trimmed)
    //const standard = control.data.style === "Standard"
    const circular = data.orientation === "Circular"
    const vertical = data.orientation === "Vertical"
    const standard = data.style === "Standard"
    const bgColors = backColors(standard, data)
    const fgColors = foreColors(standard, data)
    const cursorWidth = 2
    const alertColor = standard ? statusColor(status, fgColors) : "none"
    if (!circular) {
        const thick = vertical ? "width" : "height"
        const long = vertical ? "height" : "width"
        const width = getWidth(size, thick)
        const display = calcDisplay(standard, size, long, thick)
        const warning = calcRange(data, display, input, "warning")
        const normal = calcRange(data, display, input, "normal")
        const cursor = calcPos(display, input, trimmed)
        if (vertical) {
            const cursorLine = cursor !== null ? <>
                <line x1={0} y1={cursor} x2={width} y2={cursor}
                    stroke={fgColors.cursor} strokeWidth={cursorWidth} />
            </> : null
            const alertPath = `M 0 0 L ${width / 2} ${width} L ${width} 0 Z`
            const alertTrans = `translate(0, ${display})`
            const transform = `scale(1, -1) translate(0, -${size.height})`
            const alertElem = standard ? <g transform={alertTrans}>
                <path d={alertPath} stroke="none" fill={alertColor} />
            </g> : null
            return (
                <svg>
                    <g transform={transform}>
                        <rect x={0} y={0} width={fnn(width)} height={fnn(display)}
                            fill={bgColors.critical} />
                        <rect x={0} y={warning.min} width={fnn(width)} height={fnn(warning.span)}
                            fill={bgColors.warning} />
                        <rect x={0} y={normal.min} width={fnn(width)} height={fnn(normal.span)}
                            fill={bgColors.normal} />
                        {alertElem}
                        {cursorLine}
                    </g>
                </svg>
            )
        } else {
            const cursorLine = cursor !== null ? <>
                <line y1={0} x1={cursor} y2={width} x2={cursor}
                    stroke={fgColors.cursor} strokeWidth={cursorWidth} />
            </> : null
            const alertPath = `M 0 0 L 0 ${width} L ${width} ${width / 2} Z`
            const alertTrans = `translate(${display}, 0)`
            const alertElem = standard ? <g transform={alertTrans}>
                <path d={alertPath} stroke="none" fill={alertColor} />
            </g> : null
            return (
                <svg>
                    <rect y={0} x={0} height={fnn(width)} width={fnn(display)}
                        fill={bgColors.critical} />
                    <rect y={0} x={warning.min} height={fnn(width)} width={fnn(warning.span)}
                        fill={bgColors.warning} />
                    <rect y={0} x={normal.min} height={fnn(width)} width={fnn(normal.span)}
                        fill={bgColors.normal} />
                    {alertElem}
                    {cursorLine}
                </svg>
            )
        }
    } else {
        const tick = data.barWidth
        const center = { cx: size.width / 2, cy: size.height / 2 }
        let radius = Math.min(center.cx, center.cy) - tick / 2
        if (radius <= 0) radius = 1 //transient editing errors
        const perimeter = radius * 2 * Math.PI
        const display = radius * Number(Math.PI * data.barSpan / 180)
        const criticalDash = `${display}  ${perimeter}`
        const criticalRota = data.barZero - 180
        const criticalTrans = `rotate(${criticalRota}, ${center.cx}, ${center.cy})`
        const input = getMinMax(data, "input")
        const warning = getMinMax(data, "warning")
        warning.display = display * warning.span / input.span
        const warningDash = `${warning.display} ${perimeter}`
        let warningRota = criticalRota + data.barSpan * (warning.min - input.min) / input.span
        if (!isFinite(warningRota)) warningRota = 0 //transient editing errors
        const warningTrans = `rotate(${warningRota}, ${center.cx}, ${center.cy})`
        const normal = getMinMax(data, "normal")
        normal.display = display * normal.span / input.span
        const normalDash = `${normal.display} ${perimeter}`
        let normalRota = criticalRota + data.barSpan * (normal.min - input.min) / input.span
        if (!isFinite(normalRota)) normalRota = 0 //transient editing errors
        const normalTrans = `rotate(${normalRota}, ${center.cx}, ${center.cy})`
        const cursorWidth = 2
        const cursorDash = `${cursorWidth} ${perimeter}`
        let cursorRota = criticalRota + data.barSpan * ((trimmed - input.min) / input.span - cursorWidth / 2 / display)
        if (!isFinite(cursorRota)) cursorRota = 0 //transient editing errors
        const cursorTrans = `rotate(${cursorRota}, ${center.cx}, ${center.cy})`
        const alertRadious = radius - tick / 2
        const alertDisplay = alertRadious * Number(Math.PI * data.barSpan / 180)
        const alertDash = `${alertDisplay}  ${perimeter}`
        const alertArc = standard ? <circle r={fnn(alertRadious)} cx={center.cx} cy={center.cy} fill="none"
            strokeWidth={tick} stroke={alertColor} strokeDasharray={alertDash} /> : null
        return <>
            <svg>
                <g transform={criticalTrans}>
                    {alertArc}
                    <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={tick} stroke={bgColors.critical} strokeDasharray={criticalDash} />
                </g>
                <g transform={warningTrans}>
                    <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={tick} stroke={bgColors.warning} strokeDasharray={warningDash} />
                </g>
                <g transform={normalTrans}>
                    <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={tick} stroke={bgColors.normal} strokeDasharray={normalDash} />
                </g>
                <g transform={cursorTrans}>
                    <circle r={fnn(radius)} cx={center.cx} cy={center.cy} fill="none"
                        strokeWidth={tick} stroke={fgColors.cursor} strokeDasharray={cursorDash} />
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
