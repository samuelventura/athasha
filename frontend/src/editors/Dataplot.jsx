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
import ItemIcon from './Dataplot.svg'
import { useApp } from '../App'

function ItemEditor(props) {
    return props.show ? (<Editor {...props} />) : null
}

function ItemInitial() {
    return {
        setts: initialSetts(),
        columns: [initialColumn("DateTime"), initialColumn()],
    }
}

function initialSetts() {
    return {
        connstr: "",
        command: "",
        database: "sqlserver",
        dbpass: "",
        password: "",
        min: "0",
        max: "100",
    }
}

function initialColumn(name) {
    return { name: name || "" }
}

function Editor(props) {
    const app = useApp()
    const [setts, setSetts] = useState(ItemInitial().setts)
    const [columns, setColumns] = useState(ItemInitial().columns)
    //initialize local state
    useEffect(() => {
        const init = ItemInitial()
        const state = props.state
        setSetts(state.setts || init.setts)
        setColumns(state.columns || init.columns)
    }, [props.state])
    //rebuild and store state
    useEffect(() => {
        let valid = true
        valid = valid && checkNotBlank(setts.password)
        valid = valid && checkRange(setts.port, 1, 65535)
        valid = valid && columns.length > 0
        valid = valid && checkNotBlank(setts.database)
        valid = valid && checkNotBlank(setts.connstr)
        valid = valid && checkNotBlank(setts.command)
        valid = valid && checkNotBlank(setts.min)
        valid = valid && checkNotBlank(setts.max)
        valid = valid && columns.reduce((valid, column) => {
            valid = valid && checkNotBlank(column.name)
            return valid
        }, true)
        props.setValid(valid)
        props.store({ setts, columns })
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
                <Form.Control type="text" value={column.name}
                    onChange={e => setColumn(index, "name", e.target.value)} />
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delColumn(index)}>
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </td>
        </tr>
    )
    function onUpdate() {
        props.saveForView()
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
                        disabled={!props.valid} onClick={onUpdate}>
                        Update
                    </Button>
                    <Button variant='link' size="sm" title="Launch Viewer"
                        disabled={!props.valid} onClick={onView}>
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
                            value={setts.min} onChange={e => setProp("min", e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Plot Y Max">
                        <Form.Control type="number"
                            value={setts.max} onChange={e => setProp("max", e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Table>
                <thead>
                    <tr>
                        <th>Column</th>
                        <th>Name</th>
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

export default {
    ItemIcon,
    ItemEditor,
    ItemInitial,
}
