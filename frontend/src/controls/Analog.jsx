import React from 'react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { FormEntry } from './Tools'
import "../fonts/Fonts.css"
import "../fonts/Fonts"
import Initial from "./Analog.js"
import Check from '../editors/Check'

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

    return (
        <>
            <FormEntry label={Initial.dlabels.orientation}>
                <Form.Select {...fieldProps("orientation")}>
                    <option value="Vertical">Vertical</option>
                    <option value="Horizontal">Horizontal</option>
                    <option value="Circular">Circular</option>
                </Form.Select>
            </FormEntry>
            <FormEntry label={Initial.dlabels.style}>
                <Form.Select {...fieldProps("style")}>
                    <option value="Standard">Standard</option>
                    <option value="Custom">Custom</option>
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
    if (value === null) return null
    if (value === undefined) return null
    if (value >= data.normalMin && value <= data.normalMax) return "normal"
    if (value >= data.warningMin && value <= data.warningMax) return "warning"
    return "critical"
}

function calcDisplay(size, prop) {
    const value = size[prop]
    const zero = 0
    const span = value
    return { zero, span }
}


function getMinMax(data, type) {
    const min = Number(data[`${type}Min`])
    const max = Number(data[`${type}Max`])
    const span = max - min
    return { min, max, span }
}

function calcPos(display, input, value) {
    if (value === null) return null
    return display.zero + display.span * (value - input.min) / input.span
}

function calcRange(data, display, input, type) {
    const range = getMinMax(data, type)
    const min = calcPos(display, input, range.min)
    const max = calcPos(display, input, range.max)
    const span = max - min
    return { min, max, span }
}

function portion(size, prop) {
    const value = size[prop]
    const zero = 0
    const span = value
    return { zero, span }
}

function backColors(standard, data) {
    return {
        normal: standard ? "#b7d7e8" : data.normalColor,
        warning: standard ? "#87bdd8" : data.warningColor,
        critical: standard ? "#667292" : data.criticalColor,
    }
}

function foreColors(standard, data) {
    const initial = Initial.data()
    return {
        cursor: standard ? initial.cursorColor : data.cursorColor,
        warning: standard ? initial.warningColor : data.warningColor,
        critical: standard ? initial.criticalColor : data.criticalColor,
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
    const borderWidth = 2 * cursorWidth
    const borderColor = standard ? statusColor(status, fgColors) : "none"
    if (!circular) {
        const thick = vertical ? "width" : "height"
        const long = vertical ? "height" : "width"
        const width = portion(size, thick)
        const display = calcDisplay(size, long)
        const warning = calcRange(data, display, input, "warning")
        const normal = calcRange(data, display, input, "normal")
        const cursor = calcPos(display, input, trimmed)
        if (vertical) {
            const cursorLine = cursor !== null ? <>
                <line x1={width.zero} y1={cursor} x2={width.span} y2={cursor}
                    stroke={fgColors.cursor} strokeWidth={cursorWidth} />
            </> : null
            const transform = `scale(1, -1) translate(0, -${size.height})`
            return (
                <svg>
                    <g transform={transform}>
                        <rect x={width.zero} y={display.zero} width={width.span} height={display.span}
                            fill={bgColors.critical} />
                        <rect x={width.zero} y={warning.min} width={width.span} height={warning.span}
                            fill={bgColors.warning} />
                        <rect x={width.zero} y={normal.min} width={width.span} height={normal.span}
                            fill={bgColors.normal} />
                        <rect x={width.zero} y={display.zero} width={width.span} height={display.span}
                            stroke={borderColor} strokeWidth={borderWidth} fill="none" />
                        {cursorLine}
                    </g>
                </svg>
            )
        } else {
            const cursorLine = cursor !== null ? <>
                <line y1={width.zero} x1={cursor} y2={width.span} x2={cursor}
                    stroke={fgColors.cursor} strokeWidth={cursorWidth} />
            </> : null
            return (
                <svg>
                    <rect y={width.zero} x={display.zero} height={width.span} width={display.span}
                        fill={bgColors.critical} />
                    <rect y={width.zero} x={warning.min} height={width.span} width={warning.span}
                        fill={bgColors.warning} />
                    <rect y={width.zero} x={normal.min} height={width.span} width={normal.span}
                        fill={bgColors.normal} />
                    <rect y={width.zero} x={display.zero} height={width.span} width={display.span}
                        stroke={borderColor} strokeWidth={borderWidth} fill="none" />
                    {cursorLine}
                </svg>
            )
        }
    } else {
        const tick = data.barWidth
        const center = { cx: size.width / 2, cy: size.height / 2 }
        const radius = { cx: center.cx - tick / 2, cy: center.cy - tick / 2 }

        return <>
            <svg>
                <ellipse rx={radius.cx} ry={radius.cy} cx={center.cx} cy={center.cy} fill="none"
                    strokeWidth={tick} stroke={"red"} />
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
