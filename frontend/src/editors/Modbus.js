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

function ExportedEditor(props) {
    return props.show ? (<Editor {...props} />) : null
}

function initialState() {
    return { host: "127.0.0.1", port: "5000", delay: "10", points: [initialPoint()] }
}

function initialPoint() {
    return { slave: "1", code: "01", address: "0", name: "Point 1" }
}

function checkRange(value, min, max) {
    value = parseInt(`${value}`)
    return min <= value && value <= max
}

function checkNotBlank(value) {
    return `${value}`.trim().length > 0
}

function Editor(props) {
    const [host, setName] = useState("")
    const [port, setPort] = useState(0)
    const [delay, setDelay] = useState(0)
    const [points, setPoints] = useState([])
    // initialize local state
    useEffect(() => {
        const init = initialState()
        const state = props.state
        setName(state.host || init.host)
        setPort(state.port || init.port)
        setDelay(state.delay || init.delay)
        setPoints(state.points || init.points)
    }, [props.state])
    // rebuild and store state
    useEffect(() => {
        let valid = true
        valid = valid && checkNotBlank(host)
        valid = valid && checkRange(port, 1, 65535)
        valid = valid && checkRange(delay, 0, 1000)
        valid = valid && points.length > 0
        valid = valid && points.reduce((valid, point) => {
            valid = valid && checkRange(point.slave, 1, 65535)
            valid = valid && checkRange(point.address, 0, 65535)
            valid = valid && checkNotBlank(point.name)
            valid = valid && checkNotBlank(point.code)
            return valid
        }, true)
        props.setValid(valid)
        props.store({
            host, port, delay, points,
        })
    }, [props, host, port, delay, points])
    function setPoint(index, name, value) {
        const next = [...points]
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
    const rows = points.map((point, index) =>
        <tr key={index} id={"point_" + index}>
            <td>{index + 1}</td>
            <td>
                <Form.Control type="number" required min="1" max="65535" placeholder="Slave ID"
                    value={points[index].slave} onChange={e => setPoint(index, "slave", e.target.value)} />
            </td>
            <td>
                <Form.Select value={points[index].code} required onChange={e => setPoint(index, "code", e.target.value)}>
                    <option value="01">01 Read DO 0=OFF 1=ON</option>
                    <option value="02">02 Read DI 0=OFF 1=ON</option>
                    <option value="20">20 Read AO Float32 03:W0W1</option>
                    <option value="21">21 Read AI Float32 04:W0W1</option>
                    {/* <option value="03">03 Read Holding Registers</option>
                    <option value="04">04 Read Input Registers</option> */}
                </Form.Select>
            </td>
            <td>
                <Form.Control type="number" required min="0" max="65535" placeholder="Address"
                    value={points[index].address} onChange={e => setPoint(index, "address", e.target.value)} />
            </td>
            <td>
                <Form.Control type="text" required placeholder="Point Name"
                    value={points[index].name} onChange={e => setPoint(index, "name", e.target.value)} />
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delPoint(index)}>
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </td>
        </tr>
    )
    return (
        <Form>
            <Row>
                <Col xs={4}>
                    <FloatingLabel label="Hostname/IP Address">
                        <Form.Control autoFocus required type="text" placeholder="Hostname/IP Address"
                            value={host} onChange={e => setName(e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Port">
                        <Form.Control type="number" required min="1" max="65535" placeholder="Port"
                            value={port} onChange={e => setPort(e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Delay (ms)">
                        <Form.Control type="number" required min="0" max="1000" placeholder="Delay (ms)"
                            value={delay} onChange={e => setDelay(e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Table className='PointsTable'>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Slave ID</th>
                        <th>Function Code</th>
                        <th>Address</th>
                        <th>Point Name</th>
                        <th>
                            <Button variant='outline-primary' size="sm" onClick={addPoint}>
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

export {
    ExportedEditor as ModbusDeviceEditor,
    initialState as ModbusDeviceInitial,
}
