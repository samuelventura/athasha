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
import ItemIcon from './Opto22.svg'
import { checkRange } from "./Validation"
import { checkNotBlank } from "./Validation"
import { fixInputValue } from "./Validation"

function ItemEditor(props) {
    return props.show ? (<Editor {...props} />) : null
}

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

function Editor(props) {
    const [setts, setSetts] = useState(ItemInitial().setts)
    const [inputs, setInputs] = useState(ItemInitial().inputs)
    //initialize local state
    useEffect(() => {
        const init = ItemInitial()
        const state = props.state
        setSetts(state.setts || init.setts)
        setInputs(state.inputs || init.inputs)
    }, [props.state])
    //rebuild and store state
    useEffect(() => {
        let valid = true
        valid = valid && checkNotBlank(setts.host)
        valid = valid && checkRange(setts.port, 1, 65535)
        valid = valid && checkRange(setts.period, 0, 10000)
        valid = valid && checkRange(setts.slave, 0, 255)
        valid = valid && checkNotBlank(setts.type)
        valid = valid && inputs.length > 0
        valid = valid && inputs.reduce((valid, input) => {
            valid = valid && checkNotBlank(input.code)
            valid = valid && checkRange(input.module, 0, 15)
            valid = valid && checkRange(input.number, 0, 3)
            valid = valid && checkNotBlank(input.name)
            return valid
        }, true)
        props.setValid(valid)
        props.store({ setts, inputs })
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

export default {
    ItemIcon,
    ItemEditor,
    ItemInitial,
}
