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
import ItemIcon from './Modbus.svg'
import { checkRange } from "./Validation"
import { checkNotBlank } from "./Validation"
import { fixInputValue } from "./Validation"
import Serial from "./Serial"

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

function initialPoint() {
    return { slave: "1", code: "01", address: "0", name: "Point 1" }
}

function Editor(props) {
    const [setts, setSetts] = useState(ItemInitial().setts)
    const [points, setPoints] = useState(ItemInitial().points)
    const [trigger, setTrigger] = useState(0)
    const [serials, setSerials] = useState([])
    useEffect(() => {
        if (trigger) {
            setTrigger(false)
            Serial.fetchSerials(setSerials)
        }
    }, [trigger])
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
        valid = valid && checkNotBlank(setts.proto)
        valid = valid && checkNotBlank(setts.trans)
        switch (setts.trans) {
            case "Socket":
                valid = valid && checkNotBlank(setts.host)
                valid = valid && checkRange(setts.port, 1, 65535)
                break
            case "Serial":
                valid = valid && checkNotBlank(setts.tty)
                valid = valid && checkRange(setts.speed, 1)
                valid = valid && checkNotBlank(setts.dbpsb)
                break
        }
        valid = valid && checkRange(setts.period, 0, 10000)
        valid = valid && points.length > 0
        valid = valid && points.reduce((valid, point) => {
            valid = valid && checkRange(point.slave, 1, 65535)
            valid = valid && checkRange(point.address, 0, 65535)
            valid = valid && checkNotBlank(point.name)
            valid = valid && checkNotBlank(point.code)
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

    const configOptions = Serial.configList.map((c, i) => <option key={i} value={c}>{c}</option>)
    const serialOptions = serials.map((serial, index) => {
        return <option key={index} value={serial}>{serial}</option>
    })

    const rows = points.map((point, index) =>
        <tr key={index} className='align-middle'>
            <td >{index + 1}</td>
            <td>
                <Form.Control type="number" min="1" max="65535" placeholder="Slave ID"
                    value={point.slave} onChange={e => setPoint(index, "slave", e.target.value, e)} />
            </td>
            <td>
                <Form.Select value={point.code} onChange={e => setPoint(index, "code", e.target.value)}>
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
                    value={point.address} onChange={e => setPoint(index, "address", e.target.value, e)} />
            </td>
            <td>
                <Form.Control type="text" placeholder="Point Name"
                    value={point.name} onChange={e => setPoint(index, "name", e.target.value)} />
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delPoint(index)}
                    disabled={points.length < 2}>
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

export default {
    ItemIcon,
    ItemEditor,
    ItemInitial,
}
