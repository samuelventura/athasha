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
import Initial from './Opto22.js'
import Check from './Check'

function Editor(props) {
    const [setts, setSetts] = useState(Initial.config().setts)
    const [inputs, setInputs] = useState(Initial.config().inputs)
    const [captured, setCaptured] = useState(null)
    useEffect(() => {
        const init = Initial.config()
        const config = props.config
        setSetts(config.setts || init.setts)
        setInputs(config.inputs || init.inputs)
    }, [props.id]) //primitive type required
    useEffect(() => {
        if (props.id) { //required to prevent closing validations
            const config = { setts, inputs }
            const valid = Check.run(() => Initial.validator(config))
            props.setter({ config, valid })
        }
    }, [setts, inputs])
    function addInput() {
        const next = [...inputs]
        const input = Initial.input(next.length)
        next.push(input)
        setInputs(next)
    }
    function delInput(index) {
        if (inputs.length < 2) return
        const next = [...inputs]
        next.splice(index, 1)
        setInputs(next)
    }
    function setInputProp(index, name, value) {
        const next = [...inputs]
        next[index][name] = value
        setInputs(next)
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
    function inputProps(index, prop) {
        function setter(name) {
            return function (value) {
                setInputProp(index, name, value)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.labels.inputs[prop](index)
        args.hint = Initial.hints.inputs[prop](index)
        args.value = inputs[index][prop]
        args.setter = setter(prop)
        args.check = (value) => Initial.checks.inputs[prop](index, value)
        args.defval = Initial.input()[prop]
        return Check.props(args)
    }
    const rows = inputs.map((input, index) =>
        < tr key={index} className='align-middle' >
            <td >{index + 1}</td>
            <td>
                <Form.Select {...inputProps(index, "code")}>
                    <option value="01">4ch Digital</option>
                    <option value="02">4ch Analog</option>
                    {/* <option value="11">HD Digital</option>
                    <option value="12">HD Analog</option> */}
                </Form.Select>
            </td>
            <td>
                <Form.Control type="number" {...inputProps(index, "module")} min="0" max="15" />
            </td>
            <td>
                <Form.Control type="number" {...inputProps(index, "number")} min="1" max="4" />
            </td>
            <td>
                <Form.Control type="text" {...inputProps(index, "name")} />
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delInput(index)}
                    title="Delete Input" disabled={inputs.length < 2}>
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </td>
        </tr >
    )

    return (
        <Form>
            <Row>
                <Col xs={4}>
                    <FloatingLabel label={Initial.labels.host}>
                        <Form.Control type="text" {...settsProps("host")} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.port}>
                        <Form.Control type="number" {...settsProps("port")} min="0" max="65535" />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.period}>
                        <Form.Control type="number" {...settsProps("period")} min="1" />
                    </FloatingLabel>
                </Col>
                <Col></Col>
            </Row>
            <Row>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.type}>
                        <Form.Select {...settsProps("type")}>
                            <option value="Snap">Snap</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.slave}>
                        <Form.Control type="number" {...settsProps("slave")} min="0" max="255" />
                    </FloatingLabel>
                </Col>
                <Col></Col>
            </Row>
            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{Initial.labels.input.code}</th>
                        <th>{Initial.labels.input.module}</th>
                        <th>{Initial.labels.input.number}</th>
                        <th>{Initial.labels.input.name}</th>
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
