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
import { useApp } from '../App'

function ExportedEditor(props) {
    return props.show ? (<Editor {...props} />) : null
}

function initialState() {
    return {
        host: "127.0.0.1", port: "1433", period: "1000", points: [initialPoint()],
        database: "datalog", username: "sa", password: "", command: "insert into dbo.Table1 (COL1) values (@1)",
    }
}

function initialPoint() {
    return { id: "" }
}

function checkRange(value, min, max) {
    value = parseInt(`${value}`)
    return min <= value && value <= max
}

function checkNotBlank(value) {
    return `${value}`.trim().length > 0
}

function Editor(props) {
    const app = useApp()
    const [host, setName] = useState("")
    const [port, setPort] = useState(0)
    const [period, setPeriod] = useState(0)
    const [points, setPoints] = useState([])
    const [database, setDatabase] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [command, setCommand] = useState("")
    // initialize local state
    useEffect(() => {
        const init = initialState()
        const state = props.state
        setName(state.host || init.host)
        setPort(state.port || init.port)
        setPeriod(state.period || init.period)
        setPoints(state.points || init.points)
        setDatabase(state.database || init.database)
        setUsername(state.username || init.username)
        setPassword(state.password || init.password)
        setCommand(state.command || init.command)
    }, [props.state])
    // rebuild and store state
    useEffect(() => {
        let valid = true
        valid = valid && checkNotBlank(host)
        valid = valid && checkRange(port, 1, 65535)
        valid = valid && checkRange(period, 0, 1000)
        valid = valid && points.length > 0
        valid = valid && checkNotBlank(database)
        valid = valid && checkNotBlank(username)
        valid = valid && checkNotBlank(password)
        valid = valid && checkNotBlank(command)
        valid = valid && points.reduce((valid, point) => {
            valid = valid && checkNotBlank(point.id)
            return valid
        }, true)
        props.setValid(valid)
        props.store({
            host, port, period, points, database, username, password, command
        })
    }, [props, host, port, period, points, database, username, password, command])
    function setPoint(index, name, value) {
        const next = [...points]
        next[index][name] = value
        setPoints(next)
    }
    function addPoint() {
        const next = [...points]
        const point = initialPoint()
        next.push(point)
        setPoints(next)
    }
    function delPoint(index) {
        const next = [...points]
        next.splice(index, 1)
        setPoints(next)
    }
    const items = Object.values(app.state.items).filter(item => item.type === 'Modbus Reader')
    const options = items.map((item) => {
        const config = JSON.parse(item.config)
        return config.points.map((point, index) => {
            const id = `${item.id} ${point.name}`
            const desc = `${item.name}/${point.name}`
            return <option key={"option_" + item.id + "_" + index} value={id}>{desc}</option>
        })
    }
    ).flat()
    const rows = points.map((point, index) =>
        <tr key={index} id={"point_" + index}>
            <td>{index + 1}</td>
            <td>
                {"@" + (index + 1)}
            </td>
            <td>
                <Form.Select value={points[index].id} required onChange={e => setPoint(index, "id", e.target.value)}>
                    {options}
                </Form.Select>
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
                    <FloatingLabel label="Period (ms)">
                        <Form.Control type="number" required min="0" max="1000" placeholder="Period (ms)"
                            value={period} onChange={e => setPeriod(e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col xs={3}>
                    <FloatingLabel label="Database">
                        <Form.Control autoFocus required type="text" placeholder="Database"
                            value={database} onChange={e => setDatabase(e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col xs={3}>
                    <FloatingLabel label="Username">
                        <Form.Control type="text" required placeholder="Username"
                            value={username} onChange={e => setUsername(e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col xs={3}>
                    <FloatingLabel label="Password">
                        <Form.Control type="password" required placeholder="Password"
                            value={password} onChange={e => setPassword(e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col xs={9}>
                    <FloatingLabel label="Command">
                        <Form.Control autoFocus required type="text" placeholder="Command"
                            value={command} onChange={e => setCommand(e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>

            <Table className='PointsTable'>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Param</th>
                        <th>Point</th>
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
    ExportedEditor as DatabaseWriterEditor,
    initialState as DatabaseWriterInitial,
}
