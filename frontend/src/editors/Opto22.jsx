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
        points: [initialPoint()]
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

function initialPoint() {
    return { code: "01", module: "0", number: "0", name: "Point 1" }
}

function Editor(props) {
    const [setts, setSetts] = useState(ItemInitial().setts)
    const [points, setPoints] = useState(ItemInitial().points)
    //initialize local state
    useEffect(() => {
        const init = ItemInitial()
        const state = props.state
        setSetts(state.setts || init.setts)
        setPoints(state.points || init.points)
    }, [props.state])
    //rebuild and store state
    useEffect(() => {
        let valid = true
        valid = valid && checkNotBlank(setts.host)
        valid = valid && checkRange(setts.port, 1, 65535)
        valid = valid && checkRange(setts.period, 0, 10000)
        valid = valid && checkRange(setts.slave, 0, 255)
        valid = valid && checkNotBlank(setts.type)
        valid = valid && points.length > 0
        valid = valid && points.reduce((valid, point) => {
            valid = valid && checkNotBlank(point.code)
            valid = valid && checkRange(point.module, 0, 15)
            valid = valid && checkRange(point.number, 0, 3)
            valid = valid && checkNotBlank(point.name)
            return valid
        }, true)
        props.setValid(valid)
        props.store({ setts, points })
    }, [props, setts, points])
    function setPoint(index, name, value, e) {
        const next = [...points]
        const prev = next[index][name]
        value = fixInputValue(e, value, prev)
        next[index][name] = value
        setPoints(next)
    }
    function addPoint() {
        const next = [...points]
        const point = initialPoint()
        point.name = `Point ${next.length + 1}`
        next.push(point)
        setPoints(next)
    }
    function delPoint(index) {
        const next = [...points]
        next.splice(index, 1)
        setPoints(next)
    }
    function setProp(name, value, e) {
        const next = { ...setts }
        const prev = next[name]
        value = fixInputValue(e, value, prev)
        next[name] = value
        setSetts(next)
    }

    const rows = points.map((point, index) =>
        < tr key={index} className='align-middle' >
            <td >{index + 1}</td>
            <td>
                <Form.Select value={point.code} onChange={e => setPoint(index, "code", e.target.value)}>
                    <option value="01">4ch Digital</option>
                    <option value="02">4ch Analog</option>
                    {/* <option value="11">HD Digital</option>
                    <option value="12">HD Analog</option> */}
                </Form.Select>
            </td>
            <td>
                <Form.Control type="number" min="0" max="15" placeholder="Module"
                    value={point.module} onChange={e => setPoint(index, "module", e.target.value, e)} />
            </td>
            <td>
                <Form.Control type="number" min="0" max="3" placeholder="Point Number"
                    value={point.number} onChange={e => setPoint(index, "number", e.target.value, e)} />
            </td>
            <td>
                <Form.Control type="text" placeholder="Point Name"
                    value={point.name} onChange={e => setPoint(index, "name", e.target.value)} />
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delPoint(index)}
                    title="Delete Point" disabled={points.length < 2}>
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
                        <th>Point Type</th>
                        <th>Module</th>
                        <th>Point Number</th>
                        <th>Point Name</th>
                        <th>
                            <Button variant='outline-primary' size="sm" onClick={addPoint}
                                title="Add Point">
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
