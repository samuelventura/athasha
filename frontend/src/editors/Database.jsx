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
import { fixInputValue } from "./Validation"
import Initial from './Database.js'

function Editor(props) {
    const [setts, setSetts] = useState(ItemInitial().setts)
    const [points, setPoints] = useState(ItemInitial().points)
    useEffect(() => {
        const init = Initial.config()
        const config = props.config
        setSetts(config.setts || init.setts)
        setPoints(config.points || init.points)
    }, [props.config])
    useEffect(() => {
        if (props.id) {
            const config = { setts, points }
            const valid = Check.run(() => ItemValidator(config))
            props.setter({ config, valid })
        }
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
        function setProp(name) {
            return function (value) {
                const next = { ...setts }
                const prev = next[name]
                next[name] = value
                setSetts(next)
            }
        }
        return Check.props(labels[prop], setts[prop], setProp(prop), checks[prop])
    }
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
                        <Form.Select {...settsProps("database")}>
                            <option value="sqlserver">SQL Server</option>
                            {/* <option value="sqlite">SQLite</option> */}
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Database Password">
                        <Form.Control type="password" {...settsProps("dbpass")} />
                    </FloatingLabel>
                </Col>
                <Col xs={1}>
                    <FloatingLabel label="Period">
                        <Form.Control type="number" min="1"
                            {...settsProps("period")} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Unit">
                        <Form.Select {...settsProps("unit")} >
                            <option value="s">Second(s)</option>
                            <option value="m">Minute(s)</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FloatingLabel label="Connection String">
                        <Form.Control type="text" as="textarea"
                            {...settsProps("connstr")} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FloatingLabel label="SQL Command">
                        <Form.Control type="text" as="textarea"
                            {...settsProps("command")} />
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

export default Editor
