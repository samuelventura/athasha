import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { fixInputValue } from "./Validation"
import Initial from './Modbus.js'
import Serial from "./Serial"
import Check from './Check'

function ItemInitial() {
    return {
        setts: initialSetts(),
        inputs: [initialInput()]
    }
}

function initialSetts() {
    return {
        proto: "TCP",    //RTU
        trans: "Socket", //Serial
        host: "127.0.0.1",
        port: "502",
        tty: "COM1",
        speed: "9600",
        dbpsb: "8N1",
        period: "10",
    }
}

function initialInput() {
    return { slave: "1", code: "01", address: "0", name: "Input 1" }
}

function ItemEditor(props) {
    const [setts, setSetts] = useState(Initial.config().setts)
    const [inputs, setInputs] = useState(Initial.config().inputs)
    const [trigger, setTrigger] = useState(0)
    const [serials, setSerials] = useState([])
    useEffect(() => {
        if (trigger) {
            setTrigger(false)
            Serial.fetchSerials(setSerials)
        }
    }, [trigger])
    useEffect(() => {
        const init = ItemInitial()
        const config = props.config
        setSetts(config.setts || init.setts)
        setInputs(config.inputs || init.inputs)
    }, [props.config])
    useEffect(() => {
        if (props.id) {
            const config = { setts, inputs }
            const valid = Check.run(() => Initial.validator(config))
            props.setter({ config, valid })
        }
    }, [props, setts, inputs])
    function setInput(index, name, value, e) {
        const next = [...inputs]
        const prev = next[index][name]
        value = fixInputValue(e, value, prev)
        next[index][name] = value
        setInputs(next)
    }
    function addInput() {
        const next = [...inputs]
        const input = initialInput()
        input.name = `Input ${next.length + 1}`
        next.push(input)
        setInputs(next)
    }
    function delInput(index) {
        const next = [...inputs]
        next.splice(index, 1)
        setInputs(next)
    }
    function setProp(name, value, e) {
        const next = { ...setts }
        const prev = next[name]
        value = fixInputValue(e, value, prev)
        next[name] = value
        setSetts(next)
    }

    const configOptions = Serial.configList.map((c, i) => <option key={i} value={c}>{c}</option>)
    const serialOptions = serials.map((serial, index) => {
        return <option key={index} value={serial}>{serial}</option>
    })

    const rows = inputs.map((input, index) =>
        <tr key={index} className='align-middle'>
            <td >{index + 1}</td>
            <td>
                <Form.Control type="number" min="1" max="65535" placeholder="Slave ID"
                    value={input.slave} onChange={e => setInput(index, "slave", e.target.value, e)} />
            </td>
            <td>
                <Form.Select value={input.code} onChange={e => setInput(index, "code", e.target.value)}>
                    <option value="01">01 Coil</option>
                    <option value="02">02 Input</option>
                    <option value="31">03 U16BE</option>
                    <option value="32">03 S16BE</option>
                    <option value="33">03 U16LE</option>
                    <option value="34">03 S16LE</option>
                    <option value="35">03 F32BE</option>
                    <option value="36">03 F32LE</option>
                    <option value="41">04 U16BE</option>
                    <option value="42">04 S16BE</option>
                    <option value="43">04 U16LE</option>
                    <option value="44">04 S16LE</option>
                    <option value="45">04 F32BE</option>
                    <option value="46">04 F32LE</option>
                </Form.Select>
            </td>
            <td>
                <Form.Control type="number" min="0" max="65535" placeholder="Address"
                    value={input.address} onChange={e => setInput(index, "address", e.target.value, e)} />
            </td>
            <td>
                <Form.Control type="text" placeholder="Input Name"
                    value={input.name} onChange={e => setInput(index, "name", e.target.value)} />
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delInput(index)}
                    title="Delete Input" disabled={inputs.length < 2}>
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </td>
        </tr>
    )

    const transSocket = (<Row>
        <Col xs={4}>
            <FloatingLabel label="Hostname/IP Address">
                <Form.Control type="text"
                    value={setts.host} onChange={e => setProp("host", e.target.value)} />
            </FloatingLabel>
        </Col>
        <Col xs={2}>
            <FloatingLabel label="Port">
                <Form.Control type="number" min="1" max="65535"
                    value={setts.port} onChange={e => setProp("port", e.target.value, e)} />
            </FloatingLabel>
        </Col>
    </Row>)

    const transSerial = (<Row>
        <Col xs={4}>
            <FloatingLabel label="Serial Port Name">
                <Form.Control type="text" list="serialList"
                    onClick={() => setTrigger(true)} onFocus={() => setTrigger(true)}
                    onKeyPress={e => setTrigger(e.key === 'Enter')}
                    value={setts.tty} onChange={e => setProp("tty", e.target.value)} />
                <datalist id="serialList">
                    {serialOptions}
                </datalist>
            </FloatingLabel>
        </Col>
        <Col xs={2}>
            <FloatingLabel label="Baud Rate">
                <Form.Control type="number" min="1"
                    value={setts.speed} onChange={e => setProp("speed", e.target.value, e)} />
            </FloatingLabel>
        </Col>
        <Col xs={2}>
            <FloatingLabel label="Config">
                <Form.Select value={setts.dbpsb} onChange={e => setProp("dbpsb", e.target.value)}>
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
                    <FloatingLabel label="Transport">
                        <Form.Select value={setts.trans} onChange={e => setProp("trans", e.target.value)}>
                            <option value="Socket">Socket</option>
                            <option value="Serial">Serial</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Protocol">
                        <Form.Select value={setts.proto} onChange={e => setProp("proto", e.target.value)}>
                            <option value="TCP">TCP</option>
                            <option value="RTU">RTU</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Period (ms)">
                        <Form.Control type="number" min="0" max="10000"
                            value={setts.period} onChange={e => setProp("period", e.target.value, e)} />
                    </FloatingLabel>
                </Col>
                <Col></Col>
            </Row>
            {transEditor}
            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Slave ID</th>
                        <th>Function Code</th>
                        <th>Address</th>
                        <th>Input Name</th>
                        <th>
                            <Button variant='outline-primary' size="sm" onClick={addInput}
                                title="Add Input">
                                <FontAwesomeIcon icon={faPlus} />
                            </Button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        </Form>
    )
}

export default ItemEditor
