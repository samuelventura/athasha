import React from 'react'
import numeral from 'numeral'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import { FormEntry } from './Tools'
import "../fonts/Fonts.css"
import "../fonts/Fonts"
import Control from "../common/Control"
import Check from '../common/Check'

const $control = Control.Label
const $schema = $control.schema()
const $cond = $control.cond()

function CondEditor({ getCond, setProp, captured, setCaptured }) {
    function fieldProps(prop, checkbox) {
        function setter(name) {
            return function (value) {
                setProp(name, value)
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $cond[prop], prop)
        args.getter = () => getCond()[prop]
        args.setter = setter(prop)
        args.checkbox = checkbox
        return Check.props(args)
    }
    const condTypeOptions = $control.condTypes.map(v => <option key={v} value={v}>{v}</option>)
    const txTypeOptions = $control.textActions.map(v => <option key={v} value={v}>{v}</option>)
    return (
        <>
            <FormEntry label={$cond.type.label}>
                <Form.Select {...fieldProps("type")}>
                    {condTypeOptions}
                </Form.Select>
            </FormEntry>
            <FormEntry label="Params">
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("negate", true)} />
                    <Form.Control type="number" {...fieldProps("param1")} />
                    <Form.Control type="number" {...fieldProps("param2")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$cond.textAction.label}>
                <Form.Select {...fieldProps("textAction")}>
                    {txTypeOptions}
                </Form.Select>
            </FormEntry>
            <FormEntry label={$cond.textParam.label}>
                <InputGroup>
                    <Form.Control type="text" {...fieldProps("textParam")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$cond.textColor.label}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("textColored", true)} />
                    <Form.Control type="color" {...fieldProps("textColor")} />
                    <Form.Control type="text" {...fieldProps("textColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$cond.backColor.label}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("backColored", true)} />
                    <Form.Control type="color" {...fieldProps("backColor")} />
                    <Form.Control type="text" {...fieldProps("backColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={$cond.borderColor.label}>
                <InputGroup>
                    <InputGroup.Checkbox {...fieldProps("borderColored", true)} />
                    <Form.Control type="color" {...fieldProps("borderColor")} />
                    <Form.Control type="text" {...fieldProps("borderColor")} />
                </InputGroup>
            </FormEntry>

        </>)
}

function Editor({ getControl, setProp, globals }) {
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    const control = getControl()
    const data = control.data
    const getCond = (cond) => getControl().data[cond]
    function setCondProp(cond) {
        return function (name, value) {
            const next = { ...data[cond] }
            next[name] = value
            setProp(cond, next)
        }
    }
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
    const alignOptions = $control.aligns.map(v => <option key={v} value={v}>{v}</option>)
    const ftFamilyOptions = $control.fontFamilies.map(v => <option key={v} value={v}>{v}</option>)
    return (
        <>
            <Tabs defaultActiveKey="default">
                <Tab eventKey="default" title="Default">
                    <FormEntry label={$schema.text.label}>
                        <Form.Control type="text" {...fieldProps("text")} />
                    </FormEntry>
                    <FormEntry label={$schema.align.label}>
                        <Form.Select {...fieldProps("align")}>
                            {alignOptions}
                        </Form.Select>
                    </FormEntry>
                    <FormEntry label={$schema.backColor.label}>
                        <InputGroup>
                            <InputGroup.Checkbox {...fieldProps("backColored", true)} />
                            <Form.Control type="color" {...fieldProps("backColor")} />
                            <Form.Control type="text" {...fieldProps("backColor")} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label={$schema.fontSize.label}>
                        <Form.Control type="number" {...fieldProps("fontSize")} min="1" step="1" />
                    </FormEntry>
                    <FormEntry label={$schema.fontFamily.label}>
                        <Form.Select {...fieldProps("fontFamily")}>
                            {ftFamilyOptions}
                        </Form.Select>
                    </FormEntry>
                    <FormEntry label={$schema.textColor.label}>
                        <InputGroup>
                            <Form.Control type="color" {...fieldProps("textColor")} />
                            <Form.Control type="text" {...fieldProps("textColor")} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label={$schema.borderColor.label}>
                        <InputGroup>
                            <Form.Control type="color" {...fieldProps("borderColor")} />
                            <Form.Control type="text" {...fieldProps("borderColor")} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label={$schema.borderWidth.label}>
                        <Form.Control type="number" {...fieldProps("borderWidth")} min="0" step="1" />
                    </FormEntry>
                    <FormEntry label={$schema.borderRadius.label}>
                        <Form.Control type="number" {...fieldProps("borderRadius")} min="0" max="1" step="0.1" />
                    </FormEntry>
                </Tab>
                <Tab eventKey="condition1" title="Cond 1" tabAttrs={{ title: "Overrides Default" }}>
                    <CondEditor getCond={() => getCond("cond1")} setProp={setCondProp("cond1")} captured={captured} setCaptured={setCaptured} />
                </Tab>
                <Tab eventKey="condition2" title="Cond 2" tabAttrs={{ title: "Overrides Cond 1" }}>
                    <CondEditor getCond={() => getCond("cond2")} setProp={setCondProp("cond2")} captured={captured} setCaptured={setCaptured} />
                </Tab>
                <Tab eventKey="condition3" title="Cond 3" tabAttrs={{ title: "Overrides Cond 2" }}>
                    <CondEditor getCond={() => getCond("cond3")} setProp={setCondProp("cond3")} captured={captured} setCaptured={setCaptured} />
                </Tab>
            </Tabs>
        </>
    )
}

function Renderer({ control, size, value, click, isPressed, hasHover, hoverColor }) {
    const data = control.data
    let x = "50%"
    let textAnchor = "middle"
    switch (data.align) {
        case "Left": {
            x = "0%"
            textAnchor = "start"
            break
        }
        case "Right": {
            x = "100%"
            textAnchor = "end"
            break
        }
    }
    const radious = `${data.borderRadius * 100}%`
    const halfBorder = Math.ceil(data.borderWidth / 2) + 2
    const fullBorder = 2 * halfBorder

    let text = data.text
    let borderColor = data.borderColor
    let textColor = data.textColor
    //passing background as default instead of none
    //puts an ugly shadow rectangle in non rounded labels
    //non passing a default background restricts the 
    //mouse action to the drawn paths instead of the whole area
    //solved by using a white background with 0 opacity below
    let backColor = data.backColored ? data.backColor : "none"

    function evalCondition(cond, value) {
        const param1 = Number(cond.param1)
        const param2 = Number(cond.param2)
        let met = false
        switch (cond.type) {
            case "Enabled":
                met = true
                break
            case "Input = Param1":
                met = (value === param1) ^ cond.negate
                break
            case "Input > Param1":
                met = (value > param1) ^ cond.negate
                break
            case "Input >= Param1":
                met = (value >= param1) ^ cond.negate
                break
            case "Param1 <= Input <= Param2":
                met = (param1 <= value && value <= param2) ^ cond.negate
                break
            case "Param1 <= Input < Param2":
                met = (param1 <= value && value < param2) ^ cond.negate
                break
            case "Param1 < Input <= Param2":
                met = (param1 < value && value <= param2) ^ cond.negate
                break
            case "Param1 < Input < Param2":
                met = (param1 < value && value < param2) ^ cond.negate
                break
        }
        if (met) {
            if (cond.backColored) backColor = cond.backColor
            if (cond.textColored) textColor = cond.textColor
            if (cond.borderColored) borderColor = cond.borderColor
            switch (cond.textAction) {
                case "Fixed Text": {
                    text = cond.textParam
                    break
                }
                case "Format Text": {
                    //http://numeraljs.com/
                    text = numeral(value).format(cond.textParam)
                    break
                }
            }
        }
    }

    //null while editing
    if (value !== null) {
        if (data.cond1.type !== "Disabled") {
            evalCondition(data.cond1, value)
        }
        if (data.cond2.type !== "Disabled") {
            evalCondition(data.cond2, value)
        }
        if (data.cond3.type !== "Disabled") {
            evalCondition(data.cond3, value)
        }
    }

    //a white fill with zero opacity makes it hoverable
    const backNone = backColor == "none"
    const backOpacity = backNone ? 0 : 1
    backColor = backNone && click ? "white" : backColor
    const font = data.fontFamily.replace(/\s/g, '') //remove spaces
    const filter = isPressed ? "url(#pressed)" : (hasHover ? "url(#hover)" : "none")
    return (
        <svg>
            <filter id='hover' colorInterpolationFilters="sRGB">
                <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.5" floodColor={hoverColor} />
            </filter>
            <filter id='pressed' colorInterpolationFilters="sRGB">
                <feOffset in="SourceGraphic" dx="1" dy="1" />
            </filter>
            <rect x={halfBorder} y={halfBorder} width={size.width - fullBorder} height={size.height - fullBorder}
                fill={backColor} fillOpacity={backOpacity} strokeWidth={data.borderWidth} stroke={borderColor} ry={radious} filter={filter} />
            <text x={x} y="50%" dominantBaseline="central" fill={textColor} filter={filter}
                textAnchor={textAnchor} fontSize={data.fontSize} fontFamily={font}>
                {text}
            </text>
        </svg>
    )
}

const exports = { $control, Editor, Renderer }

export default exports
