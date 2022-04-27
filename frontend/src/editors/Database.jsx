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
        setts: initialSetts(),
        points: [initialPoint()],
    }
}

function initialSetts() {
    return {
        host: "127.0.0.1", port: "1433", period: "1",
        database: "datalog", username: "sa", password: "",
        command: "insert into dbo.Table1 (COL1) values (@1)",
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

function fixInputMinMax(e, value) {
    if (e) {
        const t = e.target
        if (t.tagName.toLowerCase() === "input") {
            if (t.hasAttribute("min")) {
                const min = t.getAttribute("min")
                if (Number(value) < Number(min)) {
                    value = min
                }
            }
            if (t.hasAttribute("max")) {
                const max = t.getAttribute("max")
                if (Number(value) > Number(max)) {
                    value = max
                }
            }
        }
    }
    return value
}

function Editor(props) {
    const app = useApp()
    const [setts, setSetts] = useState(initialState().setts)
    const [points, setPoints] = useState(initialState().points)
    //initialize local state
    useEffect(() => {
        const init = initialState()
        const state = props.state
        setSetts(state.setts || init.setts)
        setPoints(state.points || init.points)
    }, [props.state])
    //rebuild and store state
    useEffect(() => {
        let valid = true
        valid = valid && checkNotBlank(setts.host)
        valid = valid && checkRange(setts.port, 1, 65535)
        valid = valid && checkRange(setts.period, 0, 65535)
        valid = valid && points.length > 0
        valid = valid && checkNotBlank(setts.database)
        valid = valid && checkNotBlank(setts.username)
        valid = valid && checkNotBlank(setts.password)
        valid = valid && checkNotBlank(setts.command)
        valid = valid && points.reduce((valid, point) => {
            valid = valid && checkNotBlank(point.id)
            return valid
        }, true)
        props.setValid(valid)
        props.store({ setts, points })
    }, [props, setts, points])
    function setPoint(index, name, value, e) {
        value = fixInputMinMax(e, value)
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
    function setProp(name, value, e) {
        value = fixInputMinMax(e, value)
        const next = { ...setts }
        next[name] = value
        setSetts(next)
    }
    const items = Object.values(app.state.items).filter(item => item.type === 'Modbus')
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
        <tr key={index} id={"point_" + index} className='align-middle'>
            <td>{index + 1}</td>
            <td>
                {"@" + (index + 1)}
            </td>
            <td>
                <Form.Select value={points[index].id} onChange={e => setPoint(index, "id", e.target.value)}>
                    <option value=""></option>
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
                        <Form.Control autoFocus type="text"
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
                    <FloatingLabel label="Period (s)">
                        <Form.Control type="number" min="0" max="65535"
                            value={setts.period} onChange={e => setProp("period", e.target.value, e)} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col xs={3}>
                    <FloatingLabel label="Database">
                        <Form.Control autoFocus type="text"
                            value={setts.database} onChange={e => setProp("database", e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col xs={3}>
                    <FloatingLabel label="Username">
                        <Form.Control type="text"
                            value={setts.username} onChange={e => setProp("username", e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col xs={3}>
                    <FloatingLabel label="Password">
                        <Form.Control type="password"
                            value={setts.password} onChange={e => setProp("password", e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col xs={9}>
                    <FloatingLabel label="Command">
                        <Form.Control autoFocus type="text"
                            value={setts.command} onChange={e => setProp("command", e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>

            <Table>
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
    ExportedEditor as DatabaseEditor,
    initialState as DatabaseInitial,
}
