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
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import Initial from './Dataplot.js'
import Check from './Check'
import Tools from '../editor/Tools'
import { useApp } from '../App'

function Editor(props) {
    const app = useApp()
    const [setts, setSetts] = useState(Initial.config().setts)
    const [columns, setColumns] = useState(Initial.config().columns)
    const [captured, setCaptured] = useState(null)
    useEffect(() => {
        const init = Initial.config()
        const config = props.config
        setSetts(config.setts || init.setts)
        setColumns(config.columns || init.columns)
    }, [props.id]) //primitive type required
    useEffect(() => {
        if (props.id) { //required to prevent closing validations
            const config = { setts, columns }
            const valid = Check.run(() => Initial.validator(config))
            props.setter({ config, valid })
        }
    }, [setts, columns])
    function addColumn() {
        if (columns.length > 6) return
        const next = [...columns]
        const column = Initial.column(next.length)
        next.push(column)
        setColumns(next)
    }
    function delColumn(index) {
        if (index < 1 || columns.length < 3) return
        const next = [...columns]
        next.splice(index, 1)
        setColumns(next)
    }
    function moveColumn(index, inc) {
        const nindex = index + inc
        if (index < 1 || nindex < 1 || nindex >= columns.length) return
        const next = [...columns]
        next.splice(nindex, 0, next.splice(index, 1)[0])
        setColumns(next)
    }
    function settsProps(prop) {
        function setter(name) {
            return function (value) {
                const next = { ...setts }
                next[name] = value
                setSetts(next)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.labels[prop]
        args.hint = Initial.hints[prop]
        args.value = setts[prop]
        args.setter = setter(prop)
        args.check = Initial.checks[prop]
        args.defval = Initial.setts()[prop]
        return Check.props(args)
    }
    function columnProps(index, prop) {
        function setter(name) {
            return function (value) {
                const next = [...columns]
                next[index][name] = value
                setColumns(next)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.labels.columns[prop](index)
        args.hint = Initial.hints.columns[prop](index)
        args.value = columns[index][prop]
        args.setter = setter(prop)
        args.check = (value) => Initial.checks.columns[prop](index, value)
        args.defval = Initial.column()[prop]
        return Check.props(args)
    }
    const rows = columns.map((column, index) =>
        <tr key={index} className='align-middle'>
            <td>
                {index + 1}
            </td>
            <td>
                <Form.Control type="text" disabled={index == 0} {...columnProps(index, "name")} />
            </td>
            <td>
                <InputGroup>
                    <Form.Control type="color" disabled={index == 0} {...columnProps(index, "color")} />
                    <Form.Control type="text" disabled={index == 0} {...columnProps(index, "color")} />
                </InputGroup>
            </td>
            <td>
                <Button variant='outline-danger' size="sm" disabled={index < 1 || columns.length < 3}
                    onClick={() => delColumn(index)} title="Delete Row">
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
                &nbsp;
                <Button variant='outline-secondary' size="sm" onClick={() => moveColumn(index, +1)}
                    title="Move Row Down" disabled={index < 1 || index >= columns.length - 1}>
                    <FontAwesomeIcon icon={faArrowDown} />
                </Button>
                <Button variant='outline-secondary' size="sm" onClick={() => moveColumn(index, -1)}
                    title="Move Row Up" disabled={index < 2}>
                    <FontAwesomeIcon icon={faArrowUp} />
                </Button>
            </td>
        </tr>
    )
    function onTestConnstr(e) {
        e.target.disabled = true
        function done() { e.target.disabled = false }
        Tools.testConnectionString(app, setts.database, setts.connstr, setts.dbpass, done)
    }
    return (
        <Form>
            <Row>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.database}>
                        <Form.Select {...settsProps("database")}>
                            <option value="sqlserver">SQL Server</option>
                            {/* <option value="sqlite">SQLite</option> */}
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.dbpass}>
                        <Form.Control type="password" {...settsProps("dbpass")} />
                    </FloatingLabel>
                </Col>
                <Col xs={2} className="d-flex align-items-center justify-content-start">
                    <Button variant="link" onClick={(e) => onTestConnstr(e)} title="Test Connection String">
                        Test
                    </Button>
                </Col>
                <Col></Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.password}>
                        <Form.Control type="password" {...settsProps("password")} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FloatingLabel label={Initial.labels.connstr}>
                        <Form.Control type="text" as="textarea" {...settsProps("connstr")} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FloatingLabel label={Initial.labels.command}>
                        <Form.Control type="text" as="textarea"
                            value={setts.command} {...settsProps("command")} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.ymin}>
                        <Form.Control type="number" {...settsProps("ymin")} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.ymax}>
                        <Form.Control type="number"  {...settsProps("ymax")} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.yformat}>
                        <Form.Control type="text"  {...settsProps("yformat")} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.lineWidth}>
                        <Form.Control type="number"  {...settsProps("lineWidth")} min="1" step="1" />
                    </FloatingLabel>
                </Col>
            </Row>
            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{Initial.labels.column.name}</th>
                        <th>{Initial.labels.column.color}</th>
                        <th>
                            <Button variant='outline-primary' size="sm" onClick={addColumn}
                                disabled={columns.length > 6} title="Add Column">
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

export default Editor