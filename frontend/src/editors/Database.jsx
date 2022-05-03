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
import { checkRange } from "./Validation"
import { checkNotBlank } from "./Validation"
import { fixInputValue } from "./Validation"
import { PointOptions } from '../items/Points'
import ItemIcon from './Database.svg'
import { useApp } from '../App'

function ItemEditor(props) {
    return props.show ? (<Editor {...props} />) : null
}

function ItemInitial() {
    return {
        setts: initialSetts(),
        points: [initialPoint()],
    }
}

function initialSetts() {
    return {
        connstr: "",
        command: "",
        database: "sqlserver",
        period: "1",
        unit: "s",
    }
}

function initialPoint() {
    return { id: "" }
}

function Editor(props) {
    const app = useApp()
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
        valid = valid && checkRange(setts.period, 1)
        valid = valid && checkNotBlank(setts.unit)
        valid = valid && points.length > 0
        valid = valid && checkNotBlank(setts.database)
        valid = valid && checkNotBlank(setts.connstr)
        valid = valid && checkNotBlank(setts.command)
        valid = valid && points.reduce((valid, point) => {
            valid = valid && checkNotBlank(point.id)
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
    const options = PointOptions(app)
    const rows = points.map((point, index) =>
        <tr key={index} className='align-middle'>
            <td>
                {"@" + (index + 1)}
            </td>
            <td>
                <Form.Select value={point.id} onChange={e => setPoint(index, "id", e.target.value)}>
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
                <Col xs={2}>
                    <FloatingLabel label="Database">
                        <Form.Select value={setts.database} onChange={e => setProp("database", e.target.value)}>
                            <option value="sqlserver">SQL Server</option>
                            <option value="sqlite">SQLite</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={1}>
                    <FloatingLabel label="Period">
                        <Form.Control type="number" min="1"
                            value={setts.period} onChange={e => setProp("period", e.target.value, e)} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Unit">
                        <Form.Select value={setts.unit} onChange={e => setProp("unit", e.target.value)}>
                            <option value="s">second(s)</option>
                            <option value="ms">millisecond(s)</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col xs={9}>
                    <FloatingLabel label="Connection String">
                        <Form.Control type="text"
                            value={setts.connstr} onChange={e => setProp("connstr", e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col xs={9}>
                    <FloatingLabel label="SQL Command">
                        <Form.Control type="text"
                            value={setts.command} onChange={e => setProp("command", e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>

            <Table>
                <thead>
                    <tr>
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

export default {
    ItemIcon,
    ItemEditor,
    ItemInitial,
}
