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
import Tools from '../editor/Tools'
import Check from '../common/Check'
import Type from '../common/Type'
import { useApp } from '../App'

const $type = Type.Dataplot
const $schema = $type.schema()

function Editor(props) {
    const app = useApp()
    const captured = props.globals.captured
    const setCaptured = props.globals.setCaptured
    const [setts, setSetts] = useState(props.config.setts)
    const [columns, setColumns] = useState(props.config.columns)
    useEffect(() => {
        const config = props.config
        setSetts(config.setts)
        setColumns(config.columns)
    }, [props.hash])
    useEffect(() => {
        const config = { setts, columns }
        props.setter(config)
    }, [setts, columns])
    function addColumn() {
        if (columns.length > 6) return
        const next = [...columns]
        const column = $type.column(next.length)
        next.push(column)
        setColumns(next)
    }
    function delColumn(index) {
        if (index < 1) return
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
                setts[name] = value
                setSetts({ ...setts })
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $schema.setts[prop], prop)
        args.getter = () => setts[prop]
        args.setter = setter(prop)
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
        Check.fillProp(args, $schema.columns[prop], prop, index)
        args.getter = () => columns[index][prop]
        args.setter = setter(prop)
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
                <Button variant='outline-danger' size="sm" disabled={index < 1}
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
    const databaseOptions = $type.databases.map(v => <option key={v} value={v}>{v}</option>)
    return (
        <Form>
            <Row>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.database.label}>
                        <Form.Select {...settsProps("database")}>
                            {databaseOptions}
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.dbpass.label}>
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
                    <FloatingLabel label={$schema.setts.password.label}>
                        <Form.Control type="password" {...settsProps("password")} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FloatingLabel label={$schema.setts.connstr.label}>
                        <Form.Control type="text" as="textarea" {...settsProps("connstr")} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FloatingLabel label={$schema.setts.command.label}>
                        <Form.Control type="text" as="textarea"
                            value={setts.command} {...settsProps("command")} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.ymin.label}>
                        <Form.Control type="number" {...settsProps("ymin")} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.ymax.label}>
                        <Form.Control type="number"  {...settsProps("ymax")} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.yformat.label}>
                        <Form.Control type="text"  {...settsProps("yformat")} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.ywidth.label}>
                        <Form.Control type="number"  {...settsProps("ywidth")} min="0" step="1" />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.lineWidth.label}>
                        <Form.Control type="number"  {...settsProps("lineWidth")} min="1" step="1" />
                    </FloatingLabel>
                </Col>
            </Row>
            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{$schema.columns.name.header}</th>
                        <th>{$schema.columns.color.header}</th>
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