import React from 'react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { FormEntry } from './Helper'
import "../fonts/Fonts.css"
import "../fonts/Fonts"
import { checkRange } from "../editors/Validation"
import { checkNotBlank } from "../editors/Validation"
import { checkBoolean } from "../editors/Validation"

const Type = "Label"

function Init() {
    return {
        text: "Label",
        align: "Center",
        bgEnabled: false,
        bgColor: "#FFFFFF",
        fgColor: "#000000",
        fontSize: "10",
        fontFamily: "RobotoThin",
    }
}

function Validator(control) {
    const data = control.data
    let valid = true
    valid = valid && checkBoolean(data.bgEnabled)
    valid = valid && checkNotBlank(data.text)
    valid = valid && checkNotBlank(data.align)
    valid = valid && checkNotBlank(data.bgColor)
    valid = valid && checkNotBlank(data.fgColor)
    valid = valid && checkNotBlank(data.fontFamily)
    valid = valid && checkRange(data.fontSize, 1)
    return valid
}

//upgrade data format
function fixData(data) {
    const next = { ...data }
    const init = Init()
    next.align = next.align || init.align
    return next
}

function Editor({ control, setProp }) {
    const data = fixData(control.data)
    return (<>
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
        <FormEntry label="Background">
            <InputGroup>
                <InputGroup.Checkbox checked={data.bgEnabled}
                    onChange={e => setProp("bgEnabled", e.target.checked)}
                    title="Enable Background Color" />
                <Form.Control type="color" value={data.bgColor}
                    onChange={e => setProp("bgColor", e.target.value)}
                    title={data.bgColor} />
            </InputGroup>
        </FormEntry>
        <FormEntry label="Foreground">
            <InputGroup>
                <Form.Control type="color" value={data.fgColor}
                    onChange={e => setProp("fgColor", e.target.value)}
                    title={data.fgColor} />
            </InputGroup>
        </FormEntry>
        <FormEntry label="Font Size">
            <Form.Control type="number" min="1" value={data.fontSize} onChange={e => setProp("fontSize", e.target.value, e)} />
        </FormEntry>
        <FormEntry label="Font Family">
            <Form.Select value={data.fontFamily} onChange={e => setProp("fontFamily", e.target.value)}>
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
                <option value="OrbitronRegular">OrbitronRegular</option>
                <option value="OrbitronMedium">OrbitronMedium</option>
                <option value="OrbitronSemiBold">OrbitronSemiBold</option>
                <option value="OrbitronBold">OrbitronBold</option>
                <option value="OrbitronExtraBold">OrbitronExtraBold</option>
                <option value="OrbitronBlack">OrbitronBlack</option>
            </Form.Select>
        </FormEntry>
    </>)
}

function Renderer({ control, size }) {
    const setts = control.setts
    const data = fixData(control.data)
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
    return (
        <svg>
            <rect width="100%" height="100%" fill={fill} />
            <text x={x} y="50%" dominantBaseline="middle" fill={data.fgColor}
                textAnchor={textAnchor} fontSize={data.fontSize} fontFamily={data.fontFamily}>
                {data.text}
            </text>
        </svg>
    )
}

export default { Type, Init, Editor, Renderer, Validator }
