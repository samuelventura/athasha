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
import Initial from './Modbus.js'
import Serial from "./Serial"
import Check from './Check'

function Editor(props) {
    const [setts, setSetts] = useState(Initial.config().setts)
    const [inputs, setInputs] = useState(Initial.config().inputs)
    const [trigger, setTrigger] = useState(0)
    const [serials, setSerials] = useState([])
    const [captured, setCaptured] = useState(null)
    useEffect(() => {
        if (trigger) {
            setTrigger(false)
            Serial.fetchSerials(setSerials)
        }
    }, [trigger])
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
        function setProp(name) {
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
        args.setter = setProp(prop)
        args.check = Initial.checks[prop]
        args.defval = Initial.setts()[prop]
        return Check.props(args)
    }
    function inputProps(index, prop) {
        function setProp(name) {
            return function (value) {
                setInputProp(index, name, value)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.labels.inputs[prop](index)
        args.hint = Initial.hints.inputs[prop](index)
        args.value = inputs[index][prop]
        args.setter = setProp(prop)
        args.check = (value) => Initial.checks.inputs[prop](index, value)
        args.defval = Initial.input()[prop]
        return Check.props(args)
    }

    const configOptions = Serial.configList.map((c, i) => <option key={i} value={c}>{c}</option>)
    const serialOptions = serials.map((serial, index) => {
        return <option key={index} value={serial}>{serial}</option>
    })

    const rows = inputs.map((input, index) =>
        <tr key={index} className='align-middle'>
            <td >{index + 1}</td>
            <td>
                <Form.Control type="number" {...inputProps(index, "slave")} />
            </td>
            <td>
                <Form.Select {...inputProps(index, "code")} >
                    <option value="01">01 Coil</option>
                    <option value="02">02 Input</option>
                    <option value="31">03 U16BE</option>
                    <option value="32">03 S16BE</option>
                    <option value="33">03 U16LE</option>
                    <option value="34">03 S16LE</option>
                    <option value="35">03 F32BE</option>
                    <option value="36">03 F32LE</option>
                    <option value="41">04 U16BE</option>
                    <option value="42">04 S16BE</option>
                    <option value="43">04 U16LE</option>
                    <option value="44">04 S16LE</option>
                    <option value="45">04 F32BE</option>
                    <option value="46">04 F32LE</option>
                </Form.Select>
            </td>
            <td>
                <Form.Control type="number" {...inputProps(index, "address")} />
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
        </tr>
    )

    const transSocket = (<Row>
        <Col xs={4}>
            <FloatingLabel label={Initial.labels.host}>
                <Form.Control type="text" {...settsProps("host")} />
            </FloatingLabel>
        </Col>
        <Col xs={2}>
            <FloatingLabel label={Initial.labels.port}>
                <Form.Control type="number" {...settsProps("port")} />
            </FloatingLabel>
        </Col>
    </Row>)

    const transSerial = (<Row>
        <Col xs={4}>
            <FloatingLabel label={Initial.labels.tty}>
                <Form.Control type="text" list="serialList"
                    onClick={() => setTrigger(true)} onFocus={() => setTrigger(true)}
                    onKeyPress={e => setTrigger(e.key === 'Enter')}
                    {...settsProps("tty")} />
                <datalist id="serialList">
                    {serialOptions}
                </datalist>
            </FloatingLabel>
        </Col>
        <Col xs={2}>
            <FloatingLabel label={Initial.labels.speed}>
                <Form.Control type="number" {...settsProps("speed")} />
            </FloatingLabel>
        </Col>
        <Col xs={2}>
            <FloatingLabel label={Initial.labels.dbpsb}>
                <Form.Select {...settsProps("dbpsb")}>
                    {configOptions}
                </Form.Select>
            </FloatingLabel>
        </Col>

    </Row >)

    const transEditor = setts.trans === "Serial" ? transSerial : transSocket

    return (
        <Form>
            <Row>
                <Col xs={4}>
                    <FloatingLabel label={Initial.labels.trans}>
                        <Form.Select {...settsProps("trans")}>
                            <option value="Socket">Socket</option>
                            <option value="Serial">Serial</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.proto}>
                        <Form.Select {...settsProps("proto")}>
                            <option value="TCP">TCP</option>
                            <option value="RTU">RTU</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.period}>
                        <Form.Control type="number" {...settsProps("period")} />
                    </FloatingLabel>
                </Col>
                <Col></Col>
            </Row>
            {transEditor}
            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{Initial.labels.input.slave}</th>
                        <th>{Initial.labels.input.code}</th>
                        <th>{Initial.labels.input.address}</th>
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
