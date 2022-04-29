import React from 'react'
import numeral from 'numeral'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import { FormEntry } from './Helper'
import "../fonts/Fonts.css"
import "../fonts/Fonts"
import { checkRange } from "../editors/Validation"
import { checkNotBlank } from "../editors/Validation"
import { checkBoolean } from "../editors/Validation"
import { fixInputValue } from "../editors/Validation"
import { PointOptions } from '../items/Points'

const Type = "Label"

function Cond() {
    return {
        type: "Disabled",
        param: "0",
        txType: "Disabled",
        txText: "",
        bgEnabled: false,
        bgColor: "#ffffff",
        fgEnabled: false,
        fgColor: "#ffffff",
        brEnabled: false,
        brColor: "#ffffff",
    }
}

function CondEditor({ cond, setProp }) {
    return (
        <>
            <FormEntry label="Condition">
                <Form.Select value={cond.type} onChange={e => setProp("type", e.target.value)}>
                    <option value="Disabled">Disabled</option>
                    <option value="Enabled">Enabled</option>
                    <option value="Greater">Point &gt; Param</option>
                    <option value="GreaterOrEqual">Point &ge; Param</option>
                    <option value="Lesser">Point &lt; Param</option>
                    <option value="LesserOrEqual">Point &le; Param</option>
                </Form.Select>
            </FormEntry>
            <FormEntry label="Condition Param">
                <Form.Control type="number" value={cond.param}
                    onChange={e => setProp("param", e.target.value, e)} />
            </FormEntry>
            <FormEntry label="Text Action">
                <Form.Select value={cond.txType} onChange={e => setProp("txType", e.target.value)}>
                    <option value="Disabled">Disabled</option>
                    <option value="Fixed">Fixed Text</option>
                    <option value="Formatted">Format Text</option>
                </Form.Select>
            </FormEntry>
            <FormEntry label="Text Param">
                <InputGroup>
                    <Form.Control type="text" value={cond.txText}
                        onChange={e => setProp("txText", e.target.value)} />
                </InputGroup>
            </FormEntry>
            <FormEntry label="Text Color">
                <InputGroup>
                    <InputGroup.Checkbox checked={cond.fgEnabled}
                        onChange={e => setProp("fgEnabled", e.target.checked)}
                        title="Enable Text Color" />
                    <Form.Control type="color" value={cond.fgColor}
                        onChange={e => setProp("fgColor", e.target.value)}
                        title={cond.fgColor} />
                    <Form.Control type="text" pattern="#[0-9a-fA-F]{6}" value={cond.fgColor}
                        onChange={e => setProp("fgColor", e.target.value, e)} />
                </InputGroup>
            </FormEntry>
            <FormEntry label="Background">
                <InputGroup>
                    <InputGroup.Checkbox checked={cond.bgEnabled}
                        onChange={e => setProp("bgEnabled", e.target.checked)}
                        title="Enable Background Color" />
                    <Form.Control type="color" value={cond.bgColor}
                        onChange={e => setProp("bgColor", e.target.value)}
                        title={cond.bgColor} />
                    <Form.Control type="text" pattern="#[0-9a-fA-F]{6}" value={cond.bgColor}
                        onChange={e => setProp("bgColor", e.target.value, e)} />
                </InputGroup>
            </FormEntry>
            <FormEntry label="Border Color">
                <InputGroup>
                    <InputGroup.Checkbox checked={cond.brEnabled}
                        onChange={e => setProp("brEnabled", e.target.checked)}
                        title="Enable Border Color" />
                    <Form.Control type="color" value={cond.brColor}
                        onChange={e => setProp("brColor", e.target.value)}
                        title={cond.brColor} />
                    <Form.Control type="text" pattern="#[0-9a-fA-F]{6}" value={cond.brColor}
                        onChange={e => setProp("brColor", e.target.value, e)} />
                </InputGroup>
            </FormEntry>

        </>)
}

function Init() {
    return {
        point: "",
        text: "Label",
        align: "Center",
        bgEnabled: false,
        bgColor: "#ffffff",
        fgColor: "#000000",
        ftSize: "10",
        ftFamily: "RobotoThin",
        brColor: "#000000",
        brWidth: "0",
        brRadius: "0",
        cond1: Cond(),
        cond2: Cond(),
        cond3: Cond(),
    }
}

function Validator(control) {
    const data = control.data
    let valid = true
    valid = valid && checkBoolean(data.bgEnabled)
    //valid = valid && checkNotBlank(data.text)
    valid = valid && checkNotBlank(data.align)
    valid = valid && checkNotBlank(data.bgColor)
    valid = valid && checkNotBlank(data.fgColor)
    valid = valid && checkNotBlank(data.ftFamily)
    valid = valid && checkRange(data.ftSize, 1)
    valid = valid && checkNotBlank(data.brColor)
    valid = valid && checkRange(data.brWidth, 0)
    valid = valid && checkRange(data.brRadius, 0)
    valid = valid && checkNotBlank(data.cdType)
    return valid
}

function Upgrade(data) {
    const next = { ...data }
    const init = Init()
    //force upgrade on the whole condition object
    // next.cond1 = null
    // next.cond2 = null
    // next.cond3 = null
    Object.keys(init).forEach((k) => {
        next[k] = next[k] || init[k]
    })
    return next
}

function Editor({ control, setProp, app }) {
    const options = PointOptions(app)
    const data = control.data
    function setCondProp(cond) {
        return function (name, value, e) {
            const next = { ...data[cond] }
            const prev = next[name]
            value = fixInputValue(e, value, prev)
            next[name] = value
            setProp(cond, next)
        }
    }
    return (
        <>
            <Form.Select value={data.point} onChange={e => setProp("point", e.target.value)}
                title="Select Data Point">
                <option value=""></option>
                {options}
            </Form.Select>
            <Tabs defaultActiveKey="default">
                <Tab eventKey="default" title="Default">
                    <FormEntry label="Text">
                        <Form.Control type="text" value={data.text}
                            onChange={e => setProp("text", e.target.value)} />
                    </FormEntry>
                    <FormEntry label="Align">
                        <Form.Select value={data.align} onChange={e => setProp("align", e.target.value)}>
                            <option value="Center">Center</option>
                            <option value="Left">Left</option>
                            <option value="Right">Right</option>
                        </Form.Select>
                    </FormEntry>
                    <FormEntry label="Text Color">
                        <InputGroup>
                            <Form.Control type="color" value={data.fgColor}
                                onChange={e => setProp("fgColor", e.target.value)}
                                title={data.fgColor} />
                            <Form.Control type="text" pattern="#[0-9a-fA-F]{6}" value={data.fgColor}
                                onChange={e => setProp("fgColor", e.target.value, e)} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label="Font Size">
                        <Form.Control type="number" min="1" value={data.ftSize}
                            onChange={e => setProp("ftSize", e.target.value, e)} />
                    </FormEntry>
                    <FormEntry label="Font Family">
                        <Form.Select value={data.ftFamily} onChange={e => setProp("ftFamily", e.target.value)}>
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
                    <FormEntry label="Background">
                        <InputGroup>
                            <InputGroup.Checkbox checked={data.bgEnabled}
                                onChange={e => setProp("bgEnabled", e.target.checked)}
                                title="Enable Background Color" />
                            <Form.Control type="color" value={data.bgColor}
                                onChange={e => setProp("bgColor", e.target.value)}
                                title={data.bgColor} />
                            <Form.Control type="text" pattern="#[0-9a-fA-F]{6}" value={data.bgColor}
                                onChange={e => setProp("bgColor", e.target.value, e)} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label="Border Width">
                        <Form.Control type="number" min="0" value={data.brWidth}
                            onChange={e => setProp("brWidth", e.target.value, e)} />
                    </FormEntry>
                    <FormEntry label="Border Color">
                        <InputGroup>
                            <Form.Control type="color" value={data.brColor}
                                onChange={e => setProp("brColor", e.target.value)}
                                title={data.brColor} />
                            <Form.Control type="text" pattern="#[0-9a-fA-F]{6}" value={data.brColor}
                                onChange={e => setProp("brColor", e.target.value, e)} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label="Border Radius">
                        <Form.Control type="number" min="0" max="1" step="0.01" value={data.brRadius}
                            onChange={e => setProp("brRadius", e.target.value, e)} />
                    </FormEntry>
                </Tab>
                <Tab eventKey="condition1" title="Cond 1">
                    <CondEditor cond={data.cond1} setProp={setCondProp("cond1")} app={app} />
                </Tab>
                <Tab eventKey="condition2" title="Cond 2">
                    <CondEditor cond={data.cond2} setProp={setCondProp("cond2")} app={app} />
                </Tab>
                <Tab eventKey="condition3" title="Cond 3">
                    <CondEditor cond={data.cond3} setProp={setCondProp("cond3")} app={app} />
                </Tab>
            </Tabs>
        </>
    )
}

function Renderer({ control, size }) {
    const setts = control.setts
    const data = control.data
    const fill = data.bgEnabled ? data.bgColor : "none"
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
    const halfBorder = Math.ceil(data.brWidth / 2)
    const fullBorder = 2 * halfBorder
    return (
        <svg>
            <rect x={halfBorder} y={halfBorder} width={size.width - fullBorder} height={size.height - fullBorder}
                fill={fill} strokeWidth={data.brWidth} stroke={data.brColor} ry={radious} />
            <text x={x} y="50%" dominantBaseline="central" fill={data.fgColor}
                textAnchor={textAnchor} fontSize={data.ftSize} fontFamily={data.ftFamily}>
                {data.text}
            </text>
        </svg>
    )
}

function Pointer(data, append) {
    if (data.point) append(data.point)
}

export default { Type, Init, Upgrade, Editor, Renderer, Validator, Pointer }
