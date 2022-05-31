import React from 'react'
import numeral from 'numeral'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import { FormEntry } from './Tools'
import "../fonts/Fonts.css"
import "../fonts/Fonts"
import Initial from "./Label.js"
import Check from '../editors/Check'

function CondEditor({ cond, setProp, captured, setCaptured }) {
    function fieldProps(prop) {
        function setter(name) {
            return function (value) {
                setProp(name, value)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.clabels[prop]
        args.hint = Initial.chints[prop]
        args.getter = () => cond[prop]
        args.setter = setter(prop)
        args.check = Initial.cchecks[prop]
        args.defval = Initial.cond()[prop]
        return Check.props(args)
    }
    return (
        <>
            <FormEntry label={Initial.clabels.type}>
                <Form.Select {...fieldProps("type")}>
                    <option value="Disabled">Disabled</option>
                    <option value="Enabled">Enabled</option>
                    <option value="Greater">Input &gt; Param</option>
                    <option value="GreaterOrEqual">Input &ge; Param</option>
                    <option value="Lesser">Input &lt; Param</option>
                    <option value="LesserOrEqual">Input &le; Param</option>
                </Form.Select>
            </FormEntry>
            <FormEntry label={Initial.clabels.param}>
                <Form.Control type="number" {...fieldProps("param")} />
            </FormEntry>
            <FormEntry label={Initial.clabels.txType}>
                <Form.Select {...fieldProps("txType")}>
                    <option value="Disabled">Disabled</option>
                    <option value="Fixed">Fixed Text</option>
                    <option value="Format">Format Text</option>
                </Form.Select>
            </FormEntry>
            <FormEntry label={Initial.clabels.txText}>
                <InputGroup>
                    <Form.Control type="text" {...fieldProps("txText")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.clabels.fgColor}>
                <InputGroup>
                    <InputGroup.Checkbox checked={cond.fgEnabled}
                        onChange={e => setProp("fgEnabled", e.target.checked)}
                        title="Enable Text Color" />
                    <Form.Control type="color" {...fieldProps("fgColor")} />
                    <Form.Control type="text" {...fieldProps("fgColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.clabels.bgColor}>
                <InputGroup>
                    <InputGroup.Checkbox checked={cond.bgEnabled}
                        onChange={e => setProp("bgEnabled", e.target.checked)}
                        title="Enable Background Color" />
                    <Form.Control type="color" {...fieldProps("bgColor")} />
                    <Form.Control type="text" {...fieldProps("bgColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.clabels.brColor}>
                <InputGroup>
                    <InputGroup.Checkbox checked={cond.brEnabled}
                        onChange={e => setProp("brEnabled", e.target.checked)}
                        title="Enable Border Color" />
                    <Form.Control type="color" {...fieldProps("brColor")} />
                    <Form.Control type="text" {...fieldProps("brColor")} />
                </InputGroup>
            </FormEntry>

        </>)
}

function Editor({ control, setProp, globals }) {
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    const data = control.data
    function setCondProp(cond) {
        return function (name, value) {
            const next = { ...data[cond] }
            next[name] = value
            setProp(cond, next)
        }
    }
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
    return (
        <>
            <Tabs defaultActiveKey="default">
                <Tab eventKey="default" title="Default">
                    <FormEntry label={Initial.dlabels.text}>
                        <Form.Control type="text" {...fieldProps("text")} />
                    </FormEntry>
                    <FormEntry label={Initial.dlabels.align}>
                        <Form.Select {...fieldProps("align")}>
                            <option value="Center">Center</option>
                            <option value="Left">Left</option>
                            <option value="Right">Right</option>
                        </Form.Select>
                    </FormEntry>
                    <FormEntry label={Initial.dlabels.fgColor}>
                        <InputGroup>
                            <Form.Control type="color" {...fieldProps("fgColor")} />
                            <Form.Control type="text" {...fieldProps("fgColor")} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label={Initial.dlabels.ftSize}>
                        <Form.Control type="number" {...fieldProps("ftSize")} min="1" step="1" />
                    </FormEntry>
                    <FormEntry label={Initial.dlabels.ftFamily}>
                        <Form.Select {...fieldProps("ftFamily")}>
                            <option value="RobotoThin">Roboto Thin</option>
                            <option value="RobotoLight">Roboto Light</option>
                            <option value="RobotoRegular">Roboto Regular</option>
                            <option value="RobotoMedium">Roboto Medium</option>
                            <option value="RobotoBold">Roboto Bold</option>
                            <option value="RobotoBlack">Roboto Black</option>
                            <option value="Barcode39Regular">Barcode39 Regular</option>
                            <option value="Barcode39Text">Barcode39 Text</option>
                            <option value="Barcode128Regular">Barcode128 Regular</option>
                            <option value="Barcode128Text">Barcode128 Text</option>
                            <option value="OxaniumExtraLight">Oxanium Extra Light</option>
                            <option value="OxaniumLight">Oxanium Light</option>
                            <option value="OxaniumRegular">Oxanium Regular</option>
                            <option value="OxaniumMedium">Oxanium Medium</option>
                            <option value="OxaniumSemiBold">Oxanium Semi Bold</option>
                            <option value="OxaniumBold">Oxanium Bold</option>
                            <option value="OxaniumExtraBold">Oxanium Extra Bold</option>
                            <option value="OrbitronRegular">Orbitron Regular</option>
                            <option value="OrbitronMedium">Orbitron Medium</option>
                            <option value="OrbitronSemiBold">Orbitron Semi Bold</option>
                            <option value="OrbitronBold">Orbitron Bold</option>
                            <option value="OrbitronExtraBold">Orbitron Extra Bold</option>
                            <option value="OrbitronBlack">Orbitron Black</option>
                        </Form.Select>
                    </FormEntry>
                    <FormEntry label={Initial.dlabels.bgColor}>
                        <InputGroup>
                            <InputGroup.Checkbox checked={data.bgEnabled}
                                onChange={e => setProp("bgEnabled", e.target.checked)}
                                title="Enable Background Color" />
                            <Form.Control type="color" {...fieldProps("bgColor")} />
                            <Form.Control type="text" {...fieldProps("bgColor")} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label={Initial.dlabels.brWidth}>
                        <Form.Control type="number" {...fieldProps("brWidth")} min="0" step="1" />
                    </FormEntry>
                    <FormEntry label={Initial.dlabels.brColor}>
                        <InputGroup>
                            <Form.Control type="color" {...fieldProps("brColor")} />
                            <Form.Control type="text" {...fieldProps("brColor")} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label={Initial.dlabels.brRadius}>
                        <Form.Control type="number" {...fieldProps("brRadius")} min="0" max="1" step="0.1" />
                    </FormEntry>
                </Tab>
                <Tab eventKey="condition1" title="Cond 1">
                    <CondEditor cond={data.cond1} setProp={setCondProp("cond1")} captured={captured} setCaptured={setCaptured} />
                </Tab>
                <Tab eventKey="condition2" title="Cond 2">
                    <CondEditor cond={data.cond2} setProp={setCondProp("cond2")} captured={captured} setCaptured={setCaptured} />
                </Tab>
                <Tab eventKey="condition3" title="Cond 3">
                    <CondEditor cond={data.cond3} setProp={setCondProp("cond3")} captured={captured} setCaptured={setCaptured} />
                </Tab>
            </Tabs>
        </>
    )
}

function Renderer({ control, size, inputs, isPressed, hasHover, hoverColor, background }) {
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
    const radious = `${data.brRadius * 100}%`
    const halfBorder = Math.ceil(data.brWidth / 2) + 2
    const fullBorder = 2 * halfBorder

    let text = data.text
    let brColor = data.brColor
    let fgColor = data.fgColor
    //passing background as default instead of none
    //puts am ugly shadow rectangle in non rounded labels
    //non passing a default background restricts the 
    //mouse action to the drawn paths instead of the whole area
    let bgColor = data.bgEnabled ? data.bgColor : "none"

    function evalCondition(cond, value) {
        const param = Number(cond.param)
        let met = false
        switch (cond.type) {
            case "Enabled":
                met = true
                break
            case "Greater":
                met = (value > param)
                break
            case "GreaterOrEqual":
                met = (value >= param)
                break
            case "Lesser":
                met = (value < param)
                break
            case "LesserOrEqual":
                met = (value <= param)
                break
        }
        if (met) {
            if (cond.bgEnabled) bgColor = cond.bgColor
            if (cond.fgEnabled) fgColor = cond.fgColor
            if (cond.brEnabled) brColor = cond.brColor
            switch (cond.txType) {
                case "Fixed": {
                    text = cond.txText
                    break
                }
                case "Format": {
                    //http://numeraljs.com/
                    text = numeral(value).format(cond.txText)
                    break
                }
            }
        }
    }

    //null while editing
    if (inputs) {
        //decimals received as strings
        const iid = control.setts.input
        if (iid) {
            //Number(null) -> 0
            //Number(undefined) -> NaN
            let value = inputs[iid]
            if (value !== null) {
                value = Number(value)
                if (!isNaN(value)) {
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
            }
        }
    }

    const title = control.setts.title
    const output = control.setts.output
    const filter = isPressed ? "url(#pressed)" : (hasHover ? "url(#hover)" : "none")
    const overlay = <Tooltip>{title}</Tooltip>
    const trigger = output && title ? ['hover', 'focus'] : []
    return (
        <OverlayTrigger
            placement="auto"
            overlay={overlay}
            trigger={trigger}
        >
            <svg>
                <filter id='hover' colorInterpolationFilters="sRGB">
                    <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.5" floodColor={hoverColor} />
                </filter>
                <filter id='pressed' colorInterpolationFilters="sRGB">
                    <feOffset in="SourceGraphic" dx="1" dy="1" />
                </filter>
                <rect x={halfBorder} y={halfBorder} width={size.width - fullBorder} height={size.height - fullBorder}
                    fill={background || "none"} strokeWidth={data.brWidth} stroke={brColor} ry={radious} />
                <rect x={halfBorder} y={halfBorder} width={size.width - fullBorder} height={size.height - fullBorder}
                    fill={bgColor} strokeWidth={data.brWidth} stroke={brColor} ry={radious} filter={filter} />
                <text x={x} y="50%" dominantBaseline="central" fill={fgColor} filter={filter}
                    textAnchor={textAnchor} fontSize={data.ftSize} fontFamily={data.ftFamily}>
                    {text}
                </text>
            </svg>
        </OverlayTrigger >
    )
}

const Type = Initial.type
const Init = Initial.data
const Merge = Initial.merge
const Validate = Initial.validate

const Label = { Type, Init, Editor, Renderer, Validate, Merge }

export default Label
