import React from 'react'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
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
    return (
        <>
            <FormEntry label={Initial.dlabels.orientation}>
                <Form.Select {...fieldProps("orientation")}>
                    <option value="Vertical">Vertical</option>
                    <option value="Horizontal">Horizontal</option>
                    <option value="Circular">Circular</option>
                </Form.Select>
            </FormEntry>
            <FormEntry label={Initial.dlabels.displayRange}>
                <Row className="gx-0">
                    <Col><Form.Control type="number" {...fieldProps("displayRangeZero")} min="-100" max="100" /></Col>
                    <Col><Form.Control type="number" {...fieldProps("displayRangeSpan")} min="0" max="100" /></Col>
                </Row>
            </FormEntry>
            <FormEntry label={Initial.dlabels.inputScale}>
                <Row className="gx-0">
                    <Col><Form.Control type="number" {...fieldProps("inputScaleFactor")} /></Col>
                    <Col><Form.Control type="number" {...fieldProps("inputScaleOffset")} /></Col>
                </Row>
            </FormEntry>
            <FormEntry label={Initial.dlabels.inputRange}>
                <Row className="gx-0">
                    <Col><Form.Control type="number" {...fieldProps("inputRangeMin")} /></Col>
                    <Col><Form.Control type="number" {...fieldProps("inputRangeMax")} /></Col>
                </Row>
            </FormEntry>
        </>
    )
}

function Renderer() {
}

const Type = Initial.type
const Init = Initial.data
const Merge = Initial.merge
const Validate = Initial.validate

const Label = { Type, Init, Editor, Renderer, Validate, Merge }

export default Label
