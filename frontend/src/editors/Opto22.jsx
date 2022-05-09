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
import Initial from './Opto22.js'
import Check from './Check'

function ItemInitial() {
    return {
        setts: initialSetts(),
        inputs: [initialInput()]
    }
}

function initialSetts() {
    return {
        type: "Snap",
        host: "127.0.0.1",
        port: "502",
        period: "10",
        slave: "1",
    }
}

function initialInput() {
    return { code: "01", module: "0", number: "0", name: "Input 1" }
}

function ItemEditor(props) {
    const [setts, setSetts] = useState(Initial.config().setts)
    const [inputs, setInputs] = useState(Initial.config().inputs)
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

    const rows = inputs.map((input, index) =>
        < tr key={index} className='align-middle' >
            <td >{index + 1}</td>
            <td>
                <Form.Select value={input.code} onChange={e => setInput(index, "code", e.target.value)}>
                    <option value="01">4ch Digital</option>
                    <option value="02">4ch Analog</option>
                    {/* <option value="11">HD Digital</option>
                    <option value="12">HD Analog</option> */}
                </Form.Select>
            </td>
            <td>
                <Form.Control type="number" min="0" max="15" placeholder="Module"
                    value={input.module} onChange={e => setInput(index, "module", e.target.value, e)} />
            </td>
            <td>
                <Form.Control type="number" min="0" max="3" placeholder="Input Number"
                    value={input.number} onChange={e => setInput(index, "number", e.target.value, e)} />
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
        </tr >
    )

    return (
        <Form>
            <Row>
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
                <Col xs={2}>
                    <FloatingLabel label="Period (ms)">
                        <Form.Control type="number" min="0" max="10000"
                            value={setts.period} onChange={e => setProp("period", e.target.value, e)} />
                    </FloatingLabel>
                </Col>
                <Col></Col>
            </Row>
            <Row>
                <Col xs={2}>
                    <FloatingLabel label="Type">
                        <Form.Select value={setts.type} onChange={e => setProp("type", e.target.value)}>
                            <option value="Snap">Snap</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Slave">
                        <Form.Control type="number" min="0" max="255"
                            value={setts.slave} onChange={e => setProp("slave", e.target.value, e)} />
                    </FloatingLabel>
                </Col>
                <Col></Col>
            </Row>
            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Input Type</th>
                        <th>Module</th>
                        <th>Input Number</th>
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
