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
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import Initial from './Modbus.js'
import Serial from "./Serial"
import Check from './Check'

function Editor(props) {
    const [setts, setSetts] = useState(Initial.config().setts)
    const [inputs, setInputs] = useState(Initial.config().inputs)
    const [outputs, setOutputs] = useState(Initial.config().outputs)
    const [trigger, setTrigger] = useState(0)
    const [serials, setSerials] = useState([])
    const [captured, setCaptured] = useState(null)
    useEffect(() => {
        if (trigger) {
            setTrigger(false)
            Serial.fetchSerials(setSerials)
        }
    }, [trigger])
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
    function moveInput(index, inc) {
        const nindex = index + inc
        if (nindex < 0 || nindex >= inputs.length) return
        const next = [...inputs]
        next.splice(nindex, 0, next.splice(index, 1)[0])
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
    function moveOutput(index, inc) {
        const nindex = index + inc
        if (nindex < 0 || nindex >= outputs.length) return
        const next = [...outputs]
        next.splice(nindex, 0, next.splice(index, 1)[0])
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

    const configOptions = Serial.configList.map((c, i) => <option key={i} value={c}>{c}</option>)
    const serialOptions = serials.map((serial, index) => {
        return <option key={index} value={serial}>{serial}</option>
    })
    const inputOptions = Initial.inputCodes.map((code, index) => <option key={index} value={code}>{code}</option>)
    const inputRows = inputs.map((input, index) =>
        <tr key={index} className='align-middle'>
            <td >{index + 1}</td>
            <td >
                <Form.Control type="number" {...inputProps(index, "slave")} min="0" max="255" step="1" />
            </td>
            <td className='col-2'>
                <Form.Select {...inputProps(index, "code")} >
                    {inputOptions}
                </Form.Select>
            </td>
            <td>
                <Form.Control type="number" {...inputProps(index, "address")} min="1" max="65536" step="1" />
            </td>
            <td className='col-2'>
                <Form.Control type="text" {...inputProps(index, "name")} />
            </td>
            <td>
                <Form.Control type="number" {...inputProps(index, "factor")} />
            </td>
            <td>
                <Form.Control type="number" {...inputProps(index, "offset")} />
            </td>
            <td className='col-1'>
                <Button variant='outline-danger' size="sm" onClick={() => delInput(index)}
                    title="Delete Row" disabled={inputs.length < 2}>
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
                &nbsp;
                <Button variant='outline-secondary' size="sm" onClick={() => moveInput(index, +1)}
                    title="Move Row Down" disabled={index >= inputs.length - 1}>
                    <FontAwesomeIcon icon={faArrowDown} />
                </Button>
                <Button variant='outline-secondary' size="sm" onClick={() => moveInput(index, -1)}
                    title="Move Row Up" disabled={index < 1}>
                    <FontAwesomeIcon icon={faArrowUp} />
                </Button>
            </td>
        </tr>
    )
    const outputOptions = Initial.outputCodes.map((code, index) => <option key={index} value={code}>{code}</option>)
    const outputRows = outputs.map((output, index) =>
        <tr key={index} className='align-middle'>
            <td >{index + 1}</td>
            <td >
                <Form.Control type="number" {...outputProps(index, "slave")} min="0" max="255" step="1" />
            </td>
            <td className='col-2'>
                <Form.Select {...outputProps(index, "code")} >
                    {outputOptions}
                </Form.Select>
            </td>
            <td>
                <Form.Control type="number" {...outputProps(index, "address")} min="1" max="65536" step="1" />
            </td>
            <td className='col-2'>
                <Form.Control type="text" {...outputProps(index, "name")} />
            </td>
            <td>
                <Form.Control type="number" {...outputProps(index, "factor")} />
            </td>
            <td>
                <Form.Control type="number" {...outputProps(index, "offset")} />
            </td>
            <td className='col-1'>
                <Button variant='outline-danger' size="sm" onClick={() => delOutput(index)}
                    title="Delete Row" disabled={outputs.length < 2}>
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
                &nbsp;
                <Button variant='outline-secondary' size="sm" onClick={() => moveOutput(index, +1)}
                    title="Move Row Down" disabled={index >= outputs.length - 1}>
                    <FontAwesomeIcon icon={faArrowDown} />
                </Button>
                <Button variant='outline-secondary' size="sm" onClick={() => moveOutput(index, -1)}
                    title="Move Row Up" disabled={index < 1}>
                    <FontAwesomeIcon icon={faArrowUp} />
                </Button>
            </td>
        </tr>
    )

    const transSocket = (<Row>
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
    </Row>)

    const transSerial = (<Row>
        <Col xs={4}>
            <FloatingLabel label={Initial.labels.tty}>
                <Form.Control type="text" list="serialList"
                    onClick={() => setTrigger(true)} onFocus={() => setTrigger(true)}
                    onKeyPress={e => setTrigger(e.key === 'Enter')}
                    {...settsProps("tty")} />
                <datalist id="serialList">
                    {serialOptions}
                </datalist>
            </FloatingLabel>
        </Col>
        <Col xs={2}>
            <FloatingLabel label={Initial.labels.speed}>
                <Form.Control type="number" {...settsProps("speed")} min="1" step="1" />
            </FloatingLabel>
        </Col>
        <Col xs={2}>
            <FloatingLabel label={Initial.labels.dbpsb}>
                <Form.Select {...settsProps("dbpsb")}>
                    {configOptions}
                </Form.Select>
            </FloatingLabel>
        </Col>

    </Row >)

    const transEditor = setts.trans === "Serial" ? transSerial : transSocket

    return (
        <Form>
            <Row>
                <Col xs={4}>
                    <FloatingLabel label={Initial.labels.trans}>
                        <Form.Select {...settsProps("trans")}>
                            <option value="Socket">Socket</option>
                            <option value="Serial">Serial</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.proto}>
                        <Form.Select {...settsProps("proto")}>
                            <option value="TCP">TCP</option>
                            <option value="RTU">RTU</option>
                        </Form.Select>
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
            {transEditor}
            <Tabs defaultActiveKey="inputs">
                <Tab eventKey="inputs" title="Inputs">
                    <Table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>{Initial.labels.input.slave}</th>
                                <th className='col-2'>{Initial.labels.input.code}</th>
                                <th>{Initial.labels.input.address}</th>
                                <th className='col-2'>{Initial.labels.input.name}</th>
                                <th>{Initial.labels.input.factor}</th>
                                <th>{Initial.labels.input.offset}</th>
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
                                <th>{Initial.labels.output.slave}</th>
                                <th className='col-2'>{Initial.labels.output.code}</th>
                                <th>{Initial.labels.output.address}</th>
                                <th className='col-2'>{Initial.labels.output.name}</th>
                                <th>{Initial.labels.output.factor}</th>
                                <th>{Initial.labels.output.offset}</th>
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
