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
const $config = $type.config()

function Editor(props) {
    const captured = props.globals.captured
    const setCaptured = props.globals.setCaptured
    const [setts, setSetts] = useState($config.setts)
    const [slaves, setSlaves] = useState($config.slaves)
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
    }, [props.id])
    useEffect(() => {
        if (props.id) { //required to prevent closing validations
            const config = { setts, slaves }
            props.setter(config)
        }
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
        args.label = $type.labels[prop]
        args.hint = $type.hints[prop]
        args.getter = () => setts[prop]
        args.setter = setter(prop)
        args.check = $type.checks[prop]
        args.defval = $type.setts()[prop]
        return Check.props(args)
    }
    function slaveProps(sindex, prop) {
        function setter(name) {
            return function (value) {
                setSlaveProp(sindex, name, value)
            }
        }
        const args = { captured, setCaptured }
        args.label = $type.labels.slaves[prop](sindex)
        args.hint = $type.hints.slaves[prop](sindex)
        args.getter = () => slaves[sindex][prop]
        args.setter = setter(prop)
        args.check = (value) => $type.checks.slaves[prop](sindex, value)
        args.defval = $type.slave()[prop]
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
        args.label = $type.labels.inputs[prop](pindex)
        args.hint = $type.hints.inputs[prop](pindex)
        args.getter = () => slave.inputs[pindex][prop]
        args.setter = setter(prop)
        args.check = (value) => $type.checks.inputs[prop](pindex, value)
        args.defval = $type.input()[prop]
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
        args.label = $type.labels.outputs[prop](pindex)
        args.hint = $type.hints.outputs[prop](pindex)
        args.getter = () => slave.outputs[pindex][prop]
        args.setter = setter(prop)
        args.check = (value) => $type.checks.outputs[prop](pindex, value)
        args.defval = $type.output()[prop]
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
                    <FloatingLabel label={$type.labels.trans}>
                        <Form.Select {...settsProps("trans")}>
                            {transportOptions}
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={$type.labels.proto}>
                        <Form.Select {...settsProps("proto")}>
                            {protocolOptions}
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label={$type.labels.period}>
                        <Form.Control type="number" {...settsProps("period")} min="1" step="1" />
                    </FloatingLabel>
                </Col>
                <Col></Col>
                <Col xs={2}>
                    <FloatingLabel label={$type.labels.password}>
                        <Form.Control type="password" {...settsProps("password")} />
                    </FloatingLabel>
                </Col>
            </Row>
        )
    }

    function socketTransportEditor() {
        return (<Row>
            <Col xs={4}>
                <FloatingLabel label={$type.labels.host}>
                    <Form.Control type="text" {...settsProps("host")} />
                </FloatingLabel>
            </Col>
            <Col xs={2}>
                <FloatingLabel label={$type.labels.port}>
                    <Form.Control type="number" {...settsProps("port")} min="0" max="65535" step="1" />
                </FloatingLabel>
            </Col>
        </Row>)
    }

    //autocomplete wont shot on empty input, start typing beginning of port name...
    //keyPress not emitting, onFocus replaces by check props
    function serialTransportEditor() {
        return (<Row>
            <Col xs={4}>
                <FloatingLabel label={$type.labels.tty}>
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
                <FloatingLabel label={$type.labels.speed}>
                    <Form.Control type="number" {...settsProps("speed")} min="1" step="1" />
                </FloatingLabel>
            </Col>
            <Col xs={2}>
                <FloatingLabel label={$type.labels.dbpsb}>
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
        return (
            <Tab key={sindex} eventKey={"tab" + sindex} title={"Slave " + slave.address}>
                <Row>
                    <Col xs={2}>
                        <FloatingLabel label={$type.labels.slave.address}>
                            <Form.Control type="number" {...slaveProps(sindex, "address")} min="0" max="255" step="1" />
                        </FloatingLabel>
                    </Col>
                    <Col xs={2}>
                        <FloatingLabel label={$type.labels.slave.decimals}>
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
                                    <th>{$type.labels.input.code}</th>
                                    <th>{$type.labels.input.name}</th>
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
                                    <th>{$type.labels.output.code}</th>
                                    <th>{$type.labels.output.name}</th>
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
