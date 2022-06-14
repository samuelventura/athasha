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
import Check from '../common/Check'
import Type from '../common/Type'
import Comm from "../common/Comm"
import Api from "../common/Api"

const $type = Type.Modbus
const $schema = $type.schema()

function Editor(props) {
    const captured = props.globals.captured
    const setCaptured = props.globals.setCaptured
    const [setts, setSetts] = useState(props.config.setts)
    const [inputs, setInputs] = useState(props.config.inputs)
    const [outputs, setOutputs] = useState(props.config.outputs)
    const [trigger, setTrigger] = useState(0)
    const [serials, setSerials] = useState([])
    useEffect(() => {
        if (trigger) {
            setTrigger(false)
            Api.fetchSerials(setSerials)
        }
    }, [trigger])
    useEffect(() => {
        const config = props.config
        setSetts(config.setts)
        setInputs(config.inputs)
        setOutputs(config.outputs)
    }, [props.hash])
    useEffect(() => {
        const config = { setts, inputs, outputs }
        props.setter(config)
    }, [setts, inputs, outputs])
    function addInput() {
        const next = [...inputs]
        const input = $type.input(next.length)
        next.push(input)
        setInputs(next)
    }
    function delInput(index) {
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
    function addOutput() {
        const next = [...outputs]
        const output = $type.output(next.length)
        next.push(output)
        setOutputs(next)
    }
    function delOutput(index) {
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
    function settsProps(prop) {
        function setter(name) {
            return function (value) {
                setts[name] = value
                setSetts({ ...setts })
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $schema.setts[prop], prop)
        args.getter = () => setts[prop]
        args.setter = setter(prop)
        return Check.props(args)
    }
    function inputProps(index, prop) {
        function setter(name) {
            return function (value) {
                const next = [...inputs]
                next[index][name] = value
                setInputs(next)
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $schema.inputs[prop], prop, index)
        args.getter = () => inputs[index][prop]
        args.setter = setter(prop)
        return Check.props(args)
    }
    function outputProps(index, prop) {
        function setter(name) {
            return function (value) {
                const next = [...outputs]
                next[index][name] = value
                setOutputs(next)
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $schema.outputs[prop], prop, index)
        args.getter = () => outputs[index][prop]
        args.setter = setter(prop)
        return Check.props(args)
    }

    const configOptions = Comm.serialConfigs.map(v => <option key={v} value={v}>{v}</option>)
    const serialOptions = serials.map(v => <option key={v} value={v}>{v}</option>)
    const inputOptions = $type.inputCodes.map(v => <option key={v} value={v}>{v}</option>)
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
                    title="Delete Row">
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
    const outputOptions = $type.outputCodes.map(v => <option key={v} value={v}>{v}</option>)
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
                    title="Delete Row">
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
            <FloatingLabel label={$schema.setts.host.label}>
                <Form.Control type="text" {...settsProps("host")} />
            </FloatingLabel>
        </Col>
        <Col xs={2}>
            <FloatingLabel label={$schema.setts.port.label}>
                <Form.Control type="number" {...settsProps("port")} min="0" max="65535" step="1" />
            </FloatingLabel>
        </Col>
    </Row>)

    //autocomplete wont shot on empty input, start typing beginning of port name...
    //keyPress not emitting, onFocus replaces by check props
    const transSerial = (<Row>
        <Col xs={4}>
            <FloatingLabel label={$schema.setts.tty.label}>
                <Form.Control type="text" list="serialList"
                    onClick={() => setTrigger(true)}
                    onKeyDown={e => setTrigger(e.key === 'Enter')}
                    {...settsProps("tty")} />
                <datalist id="serialList">
                    {serialOptions}
                </datalist>
            </FloatingLabel>
        </Col>
        <Col xs={2}>
            <FloatingLabel label={$schema.setts.speed.label}>
                <Form.Control type="number" {...settsProps("speed")} min="1" step="1" />
            </FloatingLabel>
        </Col>
        <Col xs={2}>
            <FloatingLabel label={$schema.setts.dbpsb.label}>
                <Form.Select {...settsProps("dbpsb")}>
                    {configOptions}
                </Form.Select>
            </FloatingLabel>
        </Col>

    </Row >)

    const transEditor = setts.trans === "Serial" ? transSerial : transSocket
    const transportOptions = $type.transports.map(v => <option key={v} value={v}>{v}</option>)
    const protocolOptions = $type.protocols.map(v => <option key={v} value={v}>{v}</option>)

    return (
        <Form>
            <Row>
                <Col xs={4}>
                    <FloatingLabel label={$schema.setts.trans.label}>
                        <Form.Select {...settsProps("trans")}>
                            {transportOptions}
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.proto.label}>
                        <Form.Select {...settsProps("proto")}>
                            {protocolOptions}
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.period.label}>
                        <Form.Control type="number" {...settsProps("period")} min="1" step="1" />
                    </FloatingLabel>
                </Col>
                <Col></Col>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.password.label}>
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
                                <th>{$schema.inputs.slave.header}</th>
                                <th className='col-2'>{$schema.inputs.code.header}</th>
                                <th>{$schema.inputs.address.header}</th>
                                <th className='col-2'>{$schema.inputs.name.header}</th>
                                <th>{$schema.inputs.factor.header}</th>
                                <th>{$schema.inputs.offset.header}</th>
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
                                <th>{$schema.outputs.slave.header}</th>
                                <th className='col-2'>{$schema.outputs.code.header}</th>
                                <th>{$schema.outputs.address.header}</th>
                                <th className='col-2'>{$schema.outputs.name.header}</th>
                                <th>{$schema.outputs.factor.header}</th>
                                <th>{$schema.outputs.offset.header}</th>
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
