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
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import Check from '../common/Check'
import Type from '../common/Type'
import Comm from "../common/Comm"
import Api from "../common/Api"

const $type = Type.Laurel
const $schema = $type.schema()

function Editor(props) {
    const captured = props.globals.captured
    const setCaptured = props.globals.setCaptured
    const [setts, setSetts] = useState(props.config.setts)
    const [slaves, setSlaves] = useState(props.config.slaves)
    const [trigger, setTrigger] = useState(0)
    const [serials, setSerials] = useState([])
    const [tab, setTab] = useState("tab0")
    useEffect(() => {
        if (trigger) {
            setTrigger(false)
            Api.fetchSerials(setSerials)
        }
    }, [trigger])
    useEffect(() => {
        const config = props.config
        setSetts(config.setts)
        setSlaves(config.slaves)
    }, [props.hash])
    useEffect(() => {
        const config = { setts, slaves }
        props.setter(config)
    }, [setts, slaves])
    function addSlave() {
        const next = [...slaves]
        const slave = $type.slave(next.length)
        next.push(slave)
        setTab("tab" + slaves.length)
        setSlaves(next)
    }
    function delSlave(sindex) {
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
        const input = $type.input(next.length)
        next.push(input)
        setSlaveProp(sindex, "inputs", next)
    }
    function delInput(sindex, pindex) {
        const slave = slaves[sindex]
        const next = [...slave.inputs]
        next.splice(pindex, 1)
        setSlaveProp(sindex, "inputs", next)
    }
    function moveInput(sindex, pindex, inc) {
        const slave = slaves[sindex]
        const index = pindex + inc
        if (index < 0 || index >= slave.inputs.length) return
        const next = [...slave.inputs]
        next.splice(index, 0, next.splice(pindex, 1)[0])
        setSlaveProp(sindex, "inputs", next)
    }
    function setInputProp(sindex, pindex, name, value) {
        const slave = slaves[sindex]
        const next = [...slave.inputs]
        next[pindex][name] = value
        setSlaveProp(sindex, "inputs", next)
    }
    function addOutput(sindex) {
        const slave = slaves[sindex]
        const next = [...slave.outputs]
        const output = $type.output(next.length)
        next.push(output)
        setSlaveProp(sindex, "outputs", next)
    }
    function delOutput(sindex, pindex) {
        const slave = slaves[sindex]
        const next = [...slave.outputs]
        next.splice(pindex, 1)
        setSlaveProp(sindex, "outputs", next)
    }
    function moveOutput(sindex, pindex, inc) {
        const slave = slaves[sindex]
        const index = pindex + inc
        if (index < 0 || index >= slave.outputs.length) return
        const next = [...slave.outputs]
        next.splice(index, 0, next.splice(pindex, 1)[0])
        setSlaveProp(sindex, "outputs", next)
    }
    function setOutputProp(sindex, pindex, name, value) {
        const slave = slaves[sindex]
        const next = [...slave.outputs]
        next[pindex][name] = value
        setSlaveProp(sindex, "outputs", next)
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
    function slaveProps(sindex, prop) {
        function setter(name) {
            return function (value) {
                setSlaveProp(sindex, name, value)
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $schema.slaves[prop], prop, sindex)
        args.getter = () => slaves[sindex][prop]
        args.setter = setter(prop)
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
        Check.fillProp(args, $schema.slaves.inputs[prop], prop, pindex)
        args.getter = () => slave.inputs[pindex][prop]
        args.setter = setter(prop)
        return Check.props(args)
    }
    function outputProps(sindex, pindex, prop) {
        function setter(name) {
            return function (value) {
                setOutputProp(sindex, pindex, name, value)
            }
        }
        const slave = slaves[sindex]
        const args = { captured, setCaptured }
        Check.fillProp(args, $schema.slaves.outputs[prop], prop, pindex)
        args.getter = () => slave.outputs[pindex][prop]
        args.setter = setter(prop)
        return Check.props(args)
    }

    const configOptions = Comm.serialConfigs.map(v => <option key={v} value={v}>{v}</option>)
    const serialOptions = serials.map(v => <option key={v} value={v}>{v}</option>)
    const transportOptions = $type.transports.map(v => <option key={v} value={v}>{v}</option>)
    const protocolOptions = $type.protocols.map(v => <option key={v} value={v}>{v}</option>)
    function subHeaderEditor() {
        return (
            <Row>
                <Col xs={4}>
                    <FloatingLabel label={$schema.setts.trans.label}>
                        <Form.Select {...settsProps("trans")}>
                            {transportOptions}
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.proto.label}>
                        <Form.Select {...settsProps("proto")}>
                            {protocolOptions}
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.period.label}>
                        <Form.Control type="number" {...settsProps("period")} min="1" step="1" />
                    </FloatingLabel>
                </Col>
                <Col></Col>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.password.label}>
                        <Form.Control type="password" {...settsProps("password")} />
                    </FloatingLabel>
                </Col>
            </Row>
        )
    }

    function socketTransportEditor() {
        return (<Row>
            <Col xs={4}>
                <FloatingLabel label={$schema.setts.host.label}>
                    <Form.Control type="text" {...settsProps("host")} />
                </FloatingLabel>
            </Col>
            <Col xs={2}>
                <FloatingLabel label={$schema.setts.port.label}>
                    <Form.Control type="number" {...settsProps("port")} min="0" max="65535" step="1" />
                </FloatingLabel>
            </Col>
        </Row>)
    }

    //autocomplete wont show on empty input, start typing beginning of port name...
    //keyPress not emitting, onFocus replaces by check props
    function serialTransportEditor() {
        return (<Row>
            <Col xs={4}>
                <FloatingLabel label={$schema.setts.tty.label}>
                    <Form.Control type="text" list="serialList"
                        onClick={() => setTrigger(true)}
                        onKeyDown={e => setTrigger(e.key === 'Enter')}
                        {...settsProps("tty")} />
                    <datalist id="serialList">
                        {serialOptions}
                    </datalist>
                </FloatingLabel>
            </Col>
            <Col xs={2}>
                <FloatingLabel label={$schema.setts.speed.label}>
                    <Form.Control type="number" {...settsProps("speed")} min="1" step="1" />
                </FloatingLabel>
            </Col>
            <Col xs={2}>
                <FloatingLabel label={$schema.setts.dbpsb.label}>
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

    const inputOptions = $type.inputCodes.map(v => <option key={v} value={v}>{v}</option>)
    const outputOptions = $type.outputCodes.map(v => <option key={v} value={v}>{v}</option>)
    function slaveEditor({ sindex, slave }) {
        const inputRows = slave.inputs.map((input, pindex) =>
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
                        title="Delete Row">
                        <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    &nbsp;
                    <Button variant='outline-secondary' size="sm" onClick={() => moveInput(sindex, pindex, +1)}
                        title="Move Row Down" disabled={pindex >= slave.inputs.length - 1}>
                        <FontAwesomeIcon icon={faArrowDown} />
                    </Button>
                    <Button variant='outline-secondary' size="sm" onClick={() => moveInput(sindex, pindex, -1)}
                        title="Move Row Up" disabled={pindex < 1}>
                        <FontAwesomeIcon icon={faArrowUp} />
                    </Button>
                </td>
            </tr>
        )
        const outputRows = slave.outputs.map((output, pindex) =>
            <tr key={pindex} className='align-middle'>
                <td >{pindex + 1}</td>
                <td>
                    <Form.Select {...outputProps(sindex, pindex, "code")}>
                        {outputOptions}
                    </Form.Select>
                </td>
                <td>
                    <Form.Control type="text" {...outputProps(sindex, pindex, "name")} />
                </td>
                <td>
                    <Button variant='outline-danger' size="sm" onClick={() => delOutput(sindex, pindex)}
                        title="Delete Row">
                        <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    &nbsp;
                    <Button variant='outline-secondary' size="sm" onClick={() => moveOutput(sindex, pindex, +1)}
                        title="Move Row Down" disabled={pindex >= slave.outputs.length - 1}>
                        <FontAwesomeIcon icon={faArrowDown} />
                    </Button>
                    <Button variant='outline-secondary' size="sm" onClick={() => moveOutput(sindex, pindex, -1)}
                        title="Move Row Up" disabled={pindex < 1}>
                        <FontAwesomeIcon icon={faArrowUp} />
                    </Button>
                </td>
            </tr>
        )
        const slaveTypeOptions = $type.slaveTypes.map(v => <option key={v} value={v}>{v}</option>)
        return (
            <Tab key={sindex} eventKey={"tab" + sindex} title={"Slave " + slave.address}>
                <Row>
                    <Col xs={2}>
                        <FloatingLabel label={$schema.slaves.type.label}>
                            <Form.Select {...slaveProps(sindex, "type")}>
                                {slaveTypeOptions}
                            </Form.Select>
                        </FloatingLabel>
                    </Col>
                    <Col xs={2}>
                        <FloatingLabel label={$schema.slaves.address.label}>
                            <Form.Control type="number" {...slaveProps(sindex, "address")} min="0" max="255" step="1" />
                        </FloatingLabel>
                    </Col>
                    <Col xs={2}>
                        <FloatingLabel label={$schema.slaves.decimals.label}>
                            <Form.Control type="number"  {...slaveProps(sindex, "decimals")} min="0" max="6" step="1" />
                        </FloatingLabel>
                    </Col>
                    <Col></Col>
                    <Col xs={1}>
                        <Button variant='outline-danger' size="sm" onClick={() => delSlave(sindex)}
                            title="Delete Slave">
                            <FontAwesomeIcon icon={faTimes} />
                        </Button>
                    </Col>
                </Row>
                <Tabs defaultActiveKey="inputs">
                    <Tab eventKey="inputs" title="Inputs">
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{$schema.slaves.inputs.code.header}</th>
                                    <th>{$schema.slaves.inputs.name.header}</th>
                                    <th>
                                        <Button variant='outline-primary' size="sm" onClick={() => addInput(sindex)}
                                            title="Add Input">
                                            <FontAwesomeIcon icon={faPlus} />
                                        </Button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {inputRows}
                            </tbody>
                        </Table>
                    </Tab>
                    <Tab eventKey="outputs" title="Outputs">
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{$schema.slaves.outputs.code.header}</th>
                                    <th>{$schema.slaves.outputs.name.header}</th>
                                    <th>
                                        <Button variant='outline-primary' size="sm" onClick={() => addOutput(sindex)}
                                            title="Add Output">
                                            <FontAwesomeIcon icon={faPlus} />
                                        </Button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {outputRows}
                            </tbody>
                        </Table>
                    </Tab>
                </Tabs>
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
