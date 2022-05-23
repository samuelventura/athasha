import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import Initial from './Opto22.js'
import Check from './Check'

function Editor(props) {
    const [setts, setSetts] = useState(Initial.config().setts)
    const [inputs, setInputs] = useState(Initial.config().inputs)
    const [outputs, setOutputs] = useState(Initial.config().outputs)
    const [captured, setCaptured] = useState(null)
    useEffect(() => {
        const init = Initial.config()
        const config = props.config
        setSetts(config.setts || init.setts)
        setInputs(config.inputs || init.inputs)
        setOutputs(config.outputs || init.outputs)
    }, [props.id]) //primitive type required
    useEffect(() => {
        if (props.id) { //required to prevent closing validations
            const config = { setts, inputs, outputs }
            const valid = Check.run(() => Initial.validator(config))
            props.setter({ config, valid })
        }
    }, [setts, inputs, outputs])
    function addInput() {
        const next = [...inputs]
        const input = Initial.input(next.length)
        next.push(input)
        setInputs(next)
    }
    function delInput(index) {
        if (inputs.length < 2) return
        const next = [...inputs]
        next.splice(index, 1)
        setInputs(next)
    }
    function setInputProp(index, name, value) {
        const next = [...inputs]
        next[index][name] = value
        setInputs(next)
    }
    function addOutput() {
        const next = [...outputs]
        const output = Initial.output(next.length)
        next.push(output)
        setOutputs(next)
    }
    function delOutput(index) {
        if (outputs.length < 2) return
        const next = [...outputs]
        next.splice(index, 1)
        setOutputs(next)
    }
    function setOutputProp(index, name, value) {
        const next = [...outputs]
        next[index][name] = value
        setOutputs(next)
    }
    function settsProps(prop) {
        function setter(name) {
            return function (value) {
                const next = { ...setts }
                next[name] = value
                setSetts(next)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.labels[prop]
        args.hint = Initial.hints[prop]
        args.value = setts[prop]
        args.setter = setter(prop)
        args.check = Initial.checks[prop]
        args.defval = Initial.setts()[prop]
        return Check.props(args)
    }
    function inputProps(index, prop) {
        function setter(name) {
            return function (value) {
                setInputProp(index, name, value)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.labels.inputs[prop](index)
        args.hint = Initial.hints.inputs[prop](index)
        args.value = inputs[index][prop]
        args.setter = setter(prop)
        args.check = (value) => Initial.checks.inputs[prop](index, value)
        args.defval = Initial.input()[prop]
        return Check.props(args)
    }
    function outputProps(index, prop) {
        function setter(name) {
            return function (value) {
                setOutputProp(index, name, value)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.labels.outputs[prop](index)
        args.hint = Initial.hints.outputs[prop](index)
        args.value = outputs[index][prop]
        args.setter = setter(prop)
        args.check = (value) => Initial.checks.outputs[prop](index, value)
        args.defval = Initial.output()[prop]
        return Check.props(args)
    }
    const inputOptions = Initial.inputCodes.map((code, index) => <option key={index} value={code}>{Initial.inputLabels[index]}</option>)
    const inputRows = inputs.map((input, index) =>
        < tr key={index} className='align-middle' >
            <td >{index + 1}</td>
            <td>
                <Form.Select {...inputProps(index, "code")}>
                    {inputOptions}
                </Form.Select>
            </td>
            <td>
                <Form.Control type="number" {...inputProps(index, "module")} min="0" max="15" step="1" />
            </td>
            <td>
                <Form.Control type="number" {...inputProps(index, "number")} min="1" max="4" step="1" />
            </td>
            <td>
                <Form.Control type="text" {...inputProps(index, "name")} />
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delInput(index)}
                    title="Delete Input" disabled={inputs.length < 2}>
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </td>
        </tr >
    )
    const outputOptions = Initial.outputCodes.map((code, index) => <option key={index} value={code}>{Initial.outputLabels[index]}</option>)
    const outputRows = outputs.map((output, index) =>
        < tr key={index} className='align-middle' >
            <td >{index + 1}</td>
            <td>
                <Form.Select {...outputProps(index, "code")}>
                    {outputOptions}
                </Form.Select>
            </td>
            <td>
                <Form.Control type="number" {...outputProps(index, "module")} min="0" max="15" step="1" />
            </td>
            <td>
                <Form.Control type="number" {...outputProps(index, "number")} min="1" max="4" step="1" />
            </td>
            <td>
                <Form.Control type="text" {...outputProps(index, "name")} />
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delOutput(index)}
                    title="Delete Output" disabled={outputs.length < 2}>
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </td>
        </tr >
    )

    return (
        <Form>
            <Row>
                <Col xs={4}>
                    <FloatingLabel label={Initial.labels.host}>
                        <Form.Control type="text" {...settsProps("host")} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.port}>
                        <Form.Control type="number" {...settsProps("port")} min="0" max="65535" step="1" />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.period}>
                        <Form.Control type="number" {...settsProps("period")} min="1" step="1" />
                    </FloatingLabel>
                </Col>
                <Col></Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.password}>
                        <Form.Control type="password" {...settsProps("password")} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.type}>
                        <Form.Select {...settsProps("type")}>
                            <option value="Snap">Snap</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.slave}>
                        <Form.Control type="number" {...settsProps("slave")} min="0" max="255" step="1" />
                    </FloatingLabel>
                </Col>
                <Col></Col>
            </Row>
            <Tabs defaultActiveKey="inputs">
                <Tab eventKey="inputs" title="Inputs">
                    <Table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>{Initial.labels.input.code}</th>
                                <th>{Initial.labels.input.module}</th>
                                <th>{Initial.labels.input.number}</th>
                                <th>{Initial.labels.input.name}</th>
                                <th>
                                    <Button variant='outline-primary' size="sm" onClick={addInput}
                                        title="Add Input">
                                        <FontAwesomeIcon icon={faPlus} />
                                    </Button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {inputRows}
                        </tbody>
                    </Table>
                </Tab>
                <Tab eventKey="outputs" title="Outputs">
                    <Table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>{Initial.labels.output.code}</th>
                                <th>{Initial.labels.output.module}</th>
                                <th>{Initial.labels.output.number}</th>
                                <th>{Initial.labels.output.name}</th>
                                <th>
                                    <Button variant='outline-primary' size="sm" onClick={addOutput}
                                        title="Add Output">
                                        <FontAwesomeIcon icon={faPlus} />
                                    </Button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {outputRows}
                        </tbody>
                    </Table>
                </Tab>
            </Tabs>
        </Form>
    )
}

export default Editor
