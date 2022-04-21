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
    return {
        proto: "TCP",    //RTU
        trans: "Socket", //Serial
        host: "127.0.0.1",
        port: "502",
        tty: "COM1",
        speed: "9600",
        dbpsb: "8N1",
        delay: "10",
        points: [initialPoint()]
    }
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
    const [proto, setProto] = useState("")
    const [trans, setTrans] = useState("")
    const [host, setHost] = useState("")
    const [port, setPort] = useState(0)
    const [tty, setTty] = useState("")
    const [speed, setSpeed] = useState(0)
    const [dbpsb, setDbpsb] = useState("")
    const [delay, setDelay] = useState(0)
    const [points, setPoints] = useState([])
    // initialize local state
    useEffect(() => {
        const init = initialState()
        const state = props.state
        setProto(state.proto || init.proto)
        setTrans(state.trans || init.trans)
        setHost(state.host || init.host)
        setPort(state.port || init.port)
        setTty(state.tty || init.tty)
        setSpeed(state.speed || init.speed)
        setDbpsb(state.dbpsb || init.dbpsb)
        setDelay(state.delay || init.delay)
        setPoints(state.points || init.points)
    }, [props.state])
    // rebuild and store state
    useEffect(() => {
        let valid = true
        valid = valid && checkNotBlank(proto)
        valid = valid && checkNotBlank(trans)
        switch (trans) {
            case "Socket":
                valid = valid && checkNotBlank(host)
                valid = valid && checkRange(port, 1, 65535)
                break
            case "Serial":
                valid = valid && checkNotBlank(tty)
                valid = valid && checkRange(speed, 1, 2147483647)
                valid = valid && checkNotBlank(dbpsb)
                break
        }
        valid = valid && checkRange(delay, 0, 10000)
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
            proto, trans, host, port, tty, speed, dbpsb, delay, points,
        })
    }, [props, proto, trans, host, port, tty, speed, dbpsb, delay, points])
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
                    <option value="01">01 DO 0=OFF 1=ON</option>
                    <option value="02">02 DI 0=OFF 1=ON</option>
                    <option value="21">21 Laurel Reading</option>
                    <option value="22">22 Opto22 Float32</option>
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
    const transSocket = (<Row>
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
    </Row>)
    const transSerial = (<Row>
        <Col xs={4}>
            <FloatingLabel label="Serial Port Name">
                <Form.Control autoFocus required type="text" placeholder="Serial Port Name"
                    value={tty} onChange={e => setTty(e.target.value)} />
            </FloatingLabel>
        </Col>
        <Col xs={2}>
            <FloatingLabel label="Baud Rate">
                <Form.Control type="number" required min="1" max="2147483647" placeholder="Baud Rate"
                    value={speed} onChange={e => setSpeed(e.target.value)} />
            </FloatingLabel>
        </Col>
        <Col xs={2}>
            <FloatingLabel label="Config">
                <Form.Select value={dbpsb} required onChange={e => setDbpsb(e.target.value)}>
                    <option value="8N1">8N1</option>
                    <option value="8E1">8E1</option>
                    <option value="8O1">8O1</option>
                    <option value="8N2">8N2</option>
                    <option value="8E2">8E2</option>
                    <option value="8O2">8O2</option>
                    <option value="7N1">7N1</option>
                    <option value="7E1">7E1</option>
                    <option value="7O1">7O1</option>
                    <option value="7N2">7N2</option>
                    <option value="7E2">7E2</option>
                    <option value="7O2">7O2</option>
                </Form.Select>
            </FloatingLabel>
        </Col>

    </Row>)
    const transEditor = trans === "Serial" ? transSerial : transSocket
    return (
        <Form>
            <Row>
                <Col xs={4}>
                    <FloatingLabel label="Transport">
                        <Form.Select value={trans} required onChange={e => setTrans(e.target.value)}>
                            <option value="Socket">Socket</option>
                            <option value="Serial">Serial</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Protocol">
                        <Form.Select value={proto} required onChange={e => setProto(e.target.value)}>
                            <option value="TCP">TCP</option>
                            <option value="RTU">RTU</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Delay (ms)">
                        <Form.Control type="number" required min="0" max="1000" placeholder="Delay (ms)"
                            value={delay} onChange={e => setDelay(e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col></Col>
            </Row>
            {transEditor}
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
