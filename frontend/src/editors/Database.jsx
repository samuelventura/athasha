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
import Points from '../items/Points'
import Initial from './Database.js'
import Check from './Check'
import Tools from './Tools'
import { useApp } from '../App'

function Editor(props) {
    const app = useApp()
    const [setts, setSetts] = useState(Initial.config().setts)
    const [points, setPoints] = useState(Initial.config().points)
    const [captured, setCaptured] = useState(null)
    useEffect(() => {
        const init = Initial.config()
        const config = props.config
        setSetts(config.setts || init.setts)
        setPoints(config.points || init.points)
    }, [props.id]) //primitive type required
    useEffect(() => {
        if (props.id) { //required to prevent closing validations
            const config = { setts, points }
            const valid = Check.run(() => Initial.validator(config))
            props.setter({ config, valid })
        }
    }, [setts, points])
    function addPoint() {
        const next = [...points]
        const point = Initial.point()
        next.push(point)
        setPoints(next)
    }
    function delPoint(index) {
        const next = [...points]
        next.splice(index, 1)
        setPoints(next)
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
    function pointProps(index, prop) {
        function setter(name) {
            return function (value) {
                const next = [...points]
                next[index][name] = value
                setPoints(next)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.labels.points[prop](index)
        args.hint = Initial.hints.points[prop](index)
        args.value = points[index][prop]
        args.setter = setter(prop)
        args.check = (value) => Initial.checks.points[prop](index, value)
        args.defval = Initial.point()[prop]
        return Check.props(args)
    }
    const rows = points.map((point, index) =>
        <tr key={index} className='align-middle'>
            <td>
                {"@" + (index + 1)}
            </td>
            <td>
                <Form.Select {...pointProps(index, "id")}>
                    <option value=""></option>
                    {Points.options(props.globals.points)}
                </Form.Select>
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delPoint(index)}
                    title="Delete Point">
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </td>
        </tr>
    )
    function onTestConnectionString() {
        Tools.testConnectionString(app, setts.database, setts.connstr, setts.dbpass)
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
                <Col xs={1}>
                    <FloatingLabel label={Initial.labels.period}>
                        <Form.Control type="number" {...settsProps("period")} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.unit}>
                        <Form.Select {...settsProps("unit")} >
                            <option value="s">Second(s)</option>
                            <option value="m">Minute(s)</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2} className="d-flex align-items-center justify-content-start">
                    <Button variant="link" onClick={onTestConnectionString} title="Test Connection String">
                        Test
                    </Button>
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
                        <Form.Control type="text" as="textarea" {...settsProps("command")} />
                    </FloatingLabel>
                </Col>
            </Row>

            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{Initial.labels.point.id}</th>
                        <th>
                            <Button variant='outline-primary' size="sm" onClick={addPoint}
                                title="Add Point">
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
