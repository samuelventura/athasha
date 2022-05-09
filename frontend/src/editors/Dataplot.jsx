import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { fixInputValue } from "./Validation"
import Initial from './Dataplot.js'
import Check from './Check'

function ItemInitial() {
    return {
        setts: initialSetts(),
        columns: [initialColumn("DateTime")],
    }
}

function initialSetts() {
    return {
        connstr: "",
        command: "",
        database: "sqlserver",
        dbpass: "",
        password: "",
        ymin: "0",
        ymax: "100",
        lineWidth: "1",
    }
}

function initialColumn(name) {
    return { name: name || "", color: "#000000" }
}

function getUniqueColor(n) {
    const rgb = [0, 0, 0];
    for (let i = 0; i < 24; i++) {
        rgb[i % 3] <<= 1;
        rgb[i % 3] |= n & 0x01;
        n >>= 1;
    }
    return '#' + rgb.reduce((a, c) => (c > 0x0f ? c.toString(16) : '0' + c.toString(16)) + a, '')
}

function ItemEditor(props) {
    const [setts, setSetts] = useState(Initial.config().setts)
    const [columns, setColumns] = useState(Initial.config().columns)
    useEffect(() => {
        const init = ItemInitial()
        const config = props.config
        setSetts(config.setts || init.setts)
        setColumns(config.columns || init.columns)
    }, [props.config])
    useEffect(() => {
        if (props.id) {
            const config = { setts, columns }
            const valid = Check.run(() => Initial.validator(config))
            props.setter({ config, valid })
        }
    }, [props, setts, columns])
    function setColumn(index, name, value, e) {
        const next = [...columns]
        const prev = next[index][name]
        value = fixInputValue(e, value, prev)
        next[index][name] = value
        setColumns(next)
    }
    function addColumn() {
        const next = [...columns]
        const column = initialColumn()
        column.color = getUniqueColor(columns.length)
        next.push(column)
        setColumns(next)
    }
    function delColumn(index) {
        const next = [...columns]
        next.splice(index, 1)
        setColumns(next)
    }
    function setProp(name, value, e) {
        const next = { ...setts }
        const prev = next[name]
        value = fixInputValue(e, value, prev)
        next[name] = value
        setSetts(next)
    }
    const rows = columns.map((column, index) =>
        <tr key={index} className='align-middle'>
            <td>
                {index + 1}
            </td>
            <td>
                <Form.Control type="text" value={column.name} disabled={index == 0}
                    onChange={e => setColumn(index, "name", e.target.value)} />
            </td>
            <td>
                <InputGroup>
                    <Form.Control type="color" value={column.color} onChange={e => setColumn(index, "color", e.target.value)}
                        title={setts.bgColor} disabled={index == 0} />
                    <Form.Control type="text" pattern="#[0-9a-fA-F]{6}" value={column.color}
                        onChange={e => setColumn(index, "color", e.target.value, e)} disabled={index == 0} />
                </InputGroup>
            </td>
            <td>
                <Button variant='outline-danger' size="sm" disabled={index == 0}
                    onClick={() => delColumn(index)}>
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </td>
        </tr>
    )
    function onUpdate() {
        props.accept("save-update")
    }
    function onView() {
        window.open(`dataplot.html?id=${props.id}`, '_blank').focus();
    }
    return (
        <Form>
            <Row>
                <Col xs={2}>
                    <FloatingLabel label="Database">
                        <Form.Select value={setts.database} onChange={e => setProp("database", e.target.value)}>
                            <option value="sqlserver">SQL Server</option>
                            {/* <option value="sqlite">SQLite</option> */}
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="DB Password">
                        <Form.Control type="password" title={setts.dbpass}
                            value={setts.dbpass} onChange={e => setProp("dbpass", e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col></Col>
                <Col xs={2} className="d-flex align-items-center justify-content-end">
                    <Button variant='link' size="sm" title="Apply Changes"
                        onClick={onUpdate}>
                        Update
                    </Button>
                    <Button variant='link' size="sm" title="Launch Viewer"
                        onClick={onView}>
                        View
                    </Button>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Password">
                        <Form.Control type="password" title={setts.password}
                            value={setts.password} onChange={e => setProp("password", e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FloatingLabel label="Connection String">
                        <Form.Control type="text" as="textarea"
                            value={setts.connstr} onChange={e => setProp("connstr", e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FloatingLabel label="SQL Command">
                        <Form.Control type="text" as="textarea"
                            value={setts.command} onChange={e => setProp("command", e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col xs={2}>
                    <FloatingLabel label="Plot Y Min">
                        <Form.Control type="number"
                            value={setts.ymin} onChange={e => setProp("ymin", e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Plot Y Max">
                        <Form.Control type="number"
                            value={setts.ymax} onChange={e => setProp("ymax", e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Line Width">
                        <Form.Control type="number" min="1"
                            value={setts.lineWidth} onChange={e => setProp("lineWidth", e.target.value, e)} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Table>
                <thead>
                    <tr>
                        <th>Column</th>
                        <th>Name</th>
                        <th>Color</th>
                        <th>
                            <Button variant='outline-primary' size="sm" onClick={addColumn}
                                disabled={columns.length > 6}>
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