import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import Initial from './Laurel.js'
import Serial from "./Serial"
import Check from './Check'

function Editor(props) {
    const [setts, setSetts] = useState(Initial.config().setts)
    const [slaves, setSlaves] = useState(Initial.config().slaves)
    const [trigger, setTrigger] = useState(0)
    const [serials, setSerials] = useState([])
    const [tab, setTab] = useState("tab0")
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
        setSlaves(config.slaves || init.slaves)
    }, [props.id]) //primitive type required
    useEffect(() => {
        if (props.id) { //required to prevent closing validations
            const config = { setts, slaves }
            const valid = Check.run(() => Initial.validator(config))
            props.setter({ config, valid })
        }
    }, [setts, slaves])
    function addSlave() {
        const next = [...slaves]
        const slave = Initial.slave(next.length)
        next.push(slave)
        setTab("tab" + slaves.length)
        setSlaves(next)
    }
    function delSlave(sindex) {
        if (slaves.length < 2) return
        const next = [...slaves]
        next.splice(sindex, 1)
        setTab("tab0")
        setSlaves(next)
    }
    function setSlaveProp(sindex, name, value) {
        const next = [...slaves]
        next[sindex][name] = value
        setSlaves(next)
    }
    function addInput(sindex) {
        const slave = slaves[sindex]
        const next = [...slave.inputs]
        const input = Initial.input(next.length)
        next.push(input)
        setSlaveProp(sindex, "inputs", next)
    }
    function delInput(sindex, pindex) {
        const slave = slaves[sindex]
        if (slave.inputs.length < 2) return
        const next = [...slave.inputs]
        next.splice(pindex, 1)
        setSlaveProp(sindex, "inputs", next)
    }
    function setInputProp(sindex, pindex, name, value, e) {
        const slave = slaves[sindex]
        const next = [...slave.inputs]
        next[pindex][name] = value
        setSlaveProp(sindex, "inputs", next)
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
    function slaveProps(sindex, prop) {
        function setter(name) {
            return function (value) {
                setSlaveProp(sindex, name, value)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.labels.slaves[prop](sindex)
        args.hint = Initial.hints.slaves[prop](sindex)
        args.value = slaves[sindex][prop]
        args.setter = setter(prop)
        args.check = (value) => Initial.checks.slaves[prop](sindex, value)
        args.defval = Initial.slave()[prop]
        return Check.props(args)
    }
    function inputProps(sindex, pindex, prop) {
        function setter(name) {
            return function (value) {
                setInputProp(sindex, pindex, name, value)
            }
        }
        const slave = slaves[sindex]
        const args = { captured, setCaptured }
        args.label = Initial.labels.inputs[prop](pindex)
        args.hint = Initial.hints.inputs[prop](pindex)
        args.value = slave.inputs[pindex][prop]
        args.setter = setter(prop)
        args.check = (value) => Initial.checks.inputs[prop](pindex, value)
        args.defval = Initial.input()[prop]
        return Check.props(args)
    }

    const configOptions = Serial.configList.map((c, i) => <option key={i} value={c}>{c}</option>)
    const serialOptions = serials.map((serial, index) => {
        return <option key={index} value={serial}>{serial}</option>
    })

    function subHeaderEditor() {
        return (
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
                        <Form.Control type="number" {...settsProps("period")} min="1" step="1" />
                    </FloatingLabel>
                </Col>
                <Col></Col>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.password}>
                        <Form.Control type="password" {...settsProps("password")} />
                    </FloatingLabel>
                </Col>
            </Row>
        )
    }

    function socketTransportEditor() {
        return (<Row>
            <Col xs={4}>
                <FloatingLabel label={Initial.labels.host}>
                    <Form.Control type="text" {...settsProps("host")} />
                </FloatingLabel>
            </Col>
            <Col xs={2}>
                <FloatingLabel label={Initial.labels.port}>
                    <Form.Control type="number" {...settsProps("port")} min="0" max="65535" step="1" />
                </FloatingLabel>
            </Col>
        </Row>)
    }

    function serialTransportEditor() {
        return (<Row>
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
                    <Form.Control type="number" {...settsProps("speed")} min="1" step="1" />
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
    }

    function transportEditor() {
        return setts.trans === "Serial" ?
            serialTransportEditor() :
            socketTransportEditor()
    }

    function headerEditor() {
        const subHeader = subHeaderEditor()
        const transport = transportEditor()
        return <>
            {subHeader}
            {transport}
        </>
    }

    const inputOptions = Initial.inputCodes.map((code, index) => <option key={index} value={code}>{code}</option>)
    function slaveEditor({ sindex, slave }) {
        const listRows = slave.inputs.map((input, pindex) =>
            <tr key={pindex} className='align-middle'>
                <td >{pindex + 1}</td>
                <td>
                    <Form.Select {...inputProps(sindex, pindex, "code")}>
                        {inputOptions}
                    </Form.Select>
                </td>
                <td>
                    <Form.Control type="text" {...inputProps(sindex, pindex, "name")} />
                </td>
                <td>
                    <Button variant='outline-danger' size="sm" onClick={() => delInput(sindex, pindex)}
                        title="Delete Input" disabled={slave.inputs.length < 2}>
                        <FontAwesomeIcon icon={faTimes} />
                    </Button>
                </td>
            </tr>
        )
        return (
            <Tab key={sindex} eventKey={"tab" + sindex} title={"Slave " + slave.address}>
                <Row>
                    <Col xs={2}>
                        <FloatingLabel label={Initial.labels.slave.address}>
                            <Form.Control type="number" {...slaveProps(sindex, "address")} min="0" max="255" step="1" />
                        </FloatingLabel>
                    </Col>
                    <Col xs={2}>
                        <FloatingLabel label={Initial.labels.slave.decimals}>
                            <Form.Control type="number"  {...slaveProps(sindex, "decimals")} min="0" max="6" step="1" />
                        </FloatingLabel>
                    </Col>
                    <Col></Col>
                    <Col xs={1}>
                        <Button variant='outline-danger' size="sm" onClick={() => delSlave(sindex)}
                            title="Delete Slave" disabled={slaves.length < 2}>
                            <FontAwesomeIcon icon={faTimes} />
                        </Button>
                    </Col>
                </Row>
                <Table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>{Initial.labels.input.code}</th>
                            <th>{Initial.labels.input.name}</th>
                            <th>
                                <Button variant='outline-primary' size="sm" onClick={() => addInput(sindex)}
                                    title="Add Input">
                                    <FontAwesomeIcon icon={faPlus} />
                                </Button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {listRows}
                    </tbody>
                </Table>
            </Tab>
        )
    }
    const listSlaves = slaves.map((slave, sindex) => slaveEditor({ sindex, slave }))

    function onSelectTab(key) {
        key === "add" ? addSlave() : setTab(key)
    }
    return (
        <Form>
            {headerEditor()}
            <Tabs activeKey={tab} onSelect={onSelectTab}
                className="mt-3 mb-3">
                {listSlaves}
                <Tab eventKey="add" title="Add Slave">
                </Tab>
            </Tabs>
        </Form >
    )
}

export default Editor
