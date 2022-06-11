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
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import Points from '../common/Points'
import Tools from '../editor/Tools'
import Check from '../common/Check'
import Type from '../common/Type'
import { useApp } from '../App'

const $type = Type.Datalog
const $config = $type.config()

function Editor(props) {
    const app = useApp()
    const captured = props.globals.captured
    const setCaptured = props.globals.setCaptured
    const [setts, setSetts] = useState($config.setts)
    const [inputs, setInputs] = useState($config.inputs)
    useEffect(() => {
        const config = props.config
        setSetts(config.setts)
        setInputs(config.inputs)
    }, [props.id])
    useEffect(() => {
        if (props.id) { //required to prevent closing validations
            const config = { setts, inputs }
            props.setter(config)
        }
    }, [setts, inputs])
    function addInput() {
        const next = [...inputs]
        const input = $type.input()
        next.push(input)
        setInputs(next)
    }
    function delInput(index) {
        const next = [...inputs]
        next.splice(index, 1)
        setInputs(next)
    }
    function moveInput(index, inc) {
        const nindex = index + inc
        if (nindex < 0 || nindex >= inputs.length) return
        const next = [...inputs]
        next.splice(nindex, 0, next.splice(index, 1)[0])
        setInputs(next)
    }
    function settsProps(prop) {
        function setter(name) {
            return function (value) {
                setts[name] = value
                setSetts({ ...setts })
            }
        }
        const args = { captured, setCaptured }
        args.label = $type.labels[prop]
        args.hint = $type.hints[prop]
        args.getter = () => setts[prop]
        args.setter = setter(prop)
        args.check = $type.checks[prop]
        args.defval = $type.setts()[prop]
        return Check.props(args)
    }
    function inputProps(index, prop) {
        function setter(name) {
            return function (value) {
                const next = [...inputs]
                next[index][name] = value
                setInputs(next)
            }
        }
        const args = { captured, setCaptured }
        args.label = $type.labels.inputs[prop](index)
        args.hint = $type.hints.inputs[prop](index)
        args.getter = () => inputs[index][prop]
        args.setter = setter(prop)
        args.check = (value) => $type.checks.inputs[prop](index, value)
        args.defval = $type.input()[prop]
        return Check.props(args)
    }
    const rows = inputs.map((input, index) =>
        <tr key={index} className='align-middle'>
            <td>
                {"@" + (index + 1)}
            </td>
            <td>
                <Form.Select {...inputProps(index, "id")}>
                    <option value=""></option>
                    {Points.options(props.globals.inputs)}
                </Form.Select>
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delInput(index)}
                    title="Delete Row">
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
                &nbsp;
                <Button variant='outline-secondary' size="sm" onClick={() => moveInput(index, +1)}
                    title="Move Row Down" disabled={index >= inputs.length - 1}>
                    <FontAwesomeIcon icon={faArrowDown} />
                </Button>
                <Button variant='outline-secondary' size="sm" onClick={() => moveInput(index, -1)}
                    title="Move Row Up" disabled={index < 1}>
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
    const unitOptions = $type.units.map(v => <option key={v} value={v}>{v}</option>)
    return (
        <Form>
            <Row>
                <Col xs={2}>
                    <FloatingLabel label={$type.labels.database}>
                        <Form.Select {...settsProps("database")}>
                            {databaseOptions}
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={$type.labels.dbpass}>
                        <Form.Control type="password" {...settsProps("dbpass")} />
                    </FloatingLabel>
                </Col>
                <Col xs={1}>
                    <FloatingLabel label={$type.labels.period}>
                        <Form.Control type="number" {...settsProps("period")} min="1" step="1" />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={$type.labels.unit}>
                        <Form.Select {...settsProps("unit")} >
                            {unitOptions}
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2} className="d-flex align-items-center justify-content-start">
                    <Button variant="link" onClick={(e) => onTestConnstr(e)} title="Test Connection String">
                        Test
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FloatingLabel label={$type.labels.connstr}>
                        <Form.Control type="text" as="textarea" {...settsProps("connstr")} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FloatingLabel label={$type.labels.command}>
                        <Form.Control type="text" as="textarea" {...settsProps("command")} />
                    </FloatingLabel>
                </Col>
            </Row>

            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{$type.labels.input.id}</th>
                        <th>
                            <Button variant='outline-primary' size="sm" onClick={addInput}
                                title="Add Input">
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
