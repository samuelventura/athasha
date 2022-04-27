import React from 'react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { FormEntry } from './Helper'
import '../fonts/Roboto-Black.ttf';
import '../fonts/Roboto-BlackItalic.ttf';
import '../fonts/Roboto-Bold.ttf';
import '../fonts/Roboto-BoldItalic.ttf';
import '../fonts/Roboto-Italic.ttf';
import '../fonts/Roboto-Light.ttf';
import '../fonts/Roboto-LightItalic.ttf';
import '../fonts/Roboto-Medium.ttf';
import '../fonts/Roboto-MediumItalic.ttf';
import '../fonts/Roboto-Regular.ttf';
import '../fonts/Roboto-Thin.ttf';
import '../fonts/Roboto-ThinItalic.ttf';
import '../fonts/LibreBarcode39-Regular.ttf';
import '../fonts/LibreBarcode39Text-Regular.ttf';
import '../fonts/LibreBarcode128Text-Regular.ttf';
import '../fonts/LibreBarcode128-Regular.ttf';

const Type = "Label"

function Init() {
    return {
        text: "Label",
        bgEnabled: false,
        bgColor: "#FFFFFF",
        fgColor: "#000000",
        fontSize: "10",
        fontFamily: "RobotoThin",
    }
}

function fixData(data) {
    const next = { ...data }
    next.fontFamily = data.fontFamily || "RobotoThin"
    return next
}

function Editor({ control, setProp }) {
    const data = fixData(control.data)
    return (<>
        <FormEntry label="Text">
            <Form.Control type="text" value={data.text}
                onChange={e => setProp("text", e.target.value)} />
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
            </Form.Select>
        </FormEntry>
    </>)
}

//https://fonts.google.com/
function Renderer({ control, size }) {
    const setts = control.setts
    const data = fixData(control.data)
    const fill = data.bgEnabled ? data.bgColor : "none"
    return (
        <svg>
            <rect width="100%" height="100%" fill={fill} />
            <text x="50%" y="50%" dominantBaseline="middle" fill={data.fgColor}
                textAnchor="middle" fontSize={data.fontSize} fontFamily={data.fontFamily}>
                {data.text}
            </text>
        </svg>
    )
}

export default { Type, Init, Editor, Renderer }
