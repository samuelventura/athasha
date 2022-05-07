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
import ItemIcon from './Laurel.svg'
import { checkRange } from "./Validation"
import { checkNotBlank } from "./Validation"
import { fixInputValue } from "./Validation"

function ItemEditor(props) {
    return props.show ? (<Editor {...props} />) : null
}

function ItemInitial() {
    return {
        setts: initialSetts(),
        slaves: [initialSlave()]
    }
}

function initialSetts() {
    return {
        proto: "TCP",    //RTU
        trans: "Socket", //Serial
        host: "127.0.0.1",
        port: "502",
        tty: "COM1",
        speed: "9600",
        dbpsb: "8N1",
        period: "10",
    }
}

function initialSlave() {
    return {
        address: "1",
        decimals: "0",
        points: [initialPoint()],
    }
}

function initialPoint() {
    return { code: "01", name: "Point 1" }
}

function Editor(props) {
    const [setts, setSetts] = useState(ItemInitial().setts)
    const [slaves, setSlaves] = useState(ItemInitial().slaves)
    const [trigger, setTrigger] = useState(0)
    const [serials, setSerials] = useState([])
    const [tab, setTab] = useState("tab0")
    useEffect(() => {
        if (trigger) {
            setTrigger(false)
            fetch("api/serials")
                .then(r => r.json())
                .then(l => setSerials(l))
        }
    }, [trigger])
    //initialize local state
    useEffect(() => {
        const init = ItemInitial()
        const state = props.state
        setSetts(state.setts || init.setts)
        setSlaves(state.slaves || init.slaves)
    }, [props.state])
    //rebuild and store state
    useEffect(() => {
        let valid = true
        valid = valid && checkNotBlank(setts.proto)
        valid = valid && checkNotBlank(setts.trans)
        switch (setts.trans) {
            case "Socket":
                valid = valid && checkNotBlank(setts.host)
                valid = valid && checkRange(setts.port, 1, 65535)
                break
            case "Serial":
                valid = valid && checkNotBlank(setts.tty)
                valid = valid && checkRange(setts.speed, 1)
                valid = valid && checkNotBlank(setts.dbpsb)
                break
        }
        valid = valid && checkRange(setts.period, 0, 10000)
        valid = valid && slaves.length > 0
        valid = valid && slaves.reduce((valid, slave) => {
            valid = valid && checkRange(slave.address, 0, 65535)
            valid = valid && checkRange(slave.decimals, 0)
            valid = valid && slave.points.reduce((valid, point) => {
                valid = valid && checkNotBlank(point.code)
                valid = valid && checkNotBlank(point.name)
                return valid
            }, true)
            return valid
        }, true)
        props.setValid(valid)
        props.store({ setts, slaves })
    }, [props, setts, slaves])

    const serialOptions = serials.map((serial, index) => {
        return <option key={index} value={serial}>{serial}</option>
    })

    function subHeaderEditor({ setts, setProp }) {
        return (
            <Row>
                <Col xs={4}>
                    <FloatingLabel label="Transport">
                        <Form.Select value={setts.trans} onChange={e => setProp("trans", e.target.value)}>
                            <option value="Socket">Socket</option>
                            <option value="Serial">Serial</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Protocol">
                        <Form.Select value={setts.proto} onChange={e => setProp("proto", e.target.value)}>
                            <option value="TCP">TCP</option>
                            <option value="RTU">RTU</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Period (ms)">
                        <Form.Control type="number" min="0" max="10000"
                            value={setts.period} onChange={e => setProp("period", e.target.value, e)} />
                    </FloatingLabel>
                </Col>
                <Col></Col>
            </Row>
        )
    }

    function socketTransportEditor({ setts, setProp }) {
        return (<Row>
            <Col xs={4}>
                <FloatingLabel label="Hostname/IP Address">
                    <Form.Control type="text"
                        value={setts.host} onChange={e => setProp("host", e.target.value)} />
                </FloatingLabel>
            </Col>
            <Col xs={2}>
                <FloatingLabel label="Port">
                    <Form.Control type="number" min="1" max="65535"
                        value={setts.port} onChange={e => setProp("port", e.target.value, e)} />
                </FloatingLabel>
            </Col>
        </Row>)
    }

    function serialTransportEditor({ setts, setProp }) {
        return (<Row>
            <Col xs={4}>
                <FloatingLabel label="Serial Port Name">
                    <Form.Control type="text" list="serialList"
                        onClick={() => setTrigger(true)} onFocus={() => setTrigger(true)}
                        onKeyPress={e => setTrigger(e.key === 'Enter')}
                        value={setts.tty} onChange={e => setProp("tty", e.target.value)} />
                    <datalist id="serialList">
                        {serialOptions}
                    </datalist>
                </FloatingLabel>
            </Col>
            <Col xs={2}>
                <FloatingLabel label="Baud Rate">
                    <Form.Control type="number" min="1"
                        value={setts.speed} onChange={e => setProp("speed", e.target.value, e)} />
                </FloatingLabel>
            </Col>
            <Col xs={2}>
                <FloatingLabel label="Config">
                    <Form.Select value={setts.dbpsb} onChange={e => setProp("dbpsb", e.target.value)}>
                        <option value="8N1">8N1</option>
                        <option value="8E1">8E1</option>
                        <option value="8O1">8O1</option>
                        <option value="8N2">8N2</option>
                        <option value="8E2">8E2</option>
                        <option value="8O2">8O2</option>
                        <option value="7N1">7N1</option>
                        <option value="7E1">7E1</option>
                        <option value="7O1">7O1</option>
                        <option value="7N2">7N2</option>
                        <option value="7E2">7E2</option>
                        <option value="7O2">7O2</option>
                    </Form.Select>
                </FloatingLabel>
            </Col>

        </Row >)
    }

    function transportEditor({ setts, setProp }) {
        return setts.trans === "Serial" ?
            serialTransportEditor({ setts, setProp }) :
            socketTransportEditor({ setts, setProp })
    }

    function headerEditor() {
        function setProp(name, value, e) {
            const next = { ...setts }
            const prev = next[name]
            value = fixInputValue(e, value, prev)
            next[name] = value
            setSetts(next)
        }
        const subHeader = subHeaderEditor({ setts, setProp })
        const transport = transportEditor({ setts, setProp })
        return <>
            {subHeader}
            {transport}
        </>
    }

    function setSlaveProp(sindex, name, value, e) {
        const next = [...slaves]
        const prev = next[sindex][name]
        value = fixInputValue(e, value, prev)
        next[sindex][name] = value
        setSlaves(next)
    }

    function addSlave() {
        const next = [...slaves]
        const slave = initialSlave()
        slave.address = `${next.length + 1}`
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

    function slaveEditor({ sindex, slave }) {
        function setPointProp(pindex, name, value, e) {
            const next = [...slave.points]
            const prev = next[pindex][name]
            value = fixInputValue(e, value, prev)
            next[pindex][name] = value
            setSlaveProp(sindex, "points", next)
        }
        function addPoint() {
            const next = [...slave.points]
            const point = initialPoint()
            point.name = `Point ${next.length + 1}`
            next.push(point)
            setSlaveProp(sindex, "points", next)
        }
        function delPoint(pindex) {
            const next = [...slave.points]
            next.splice(pindex, 1)
            setSlaveProp(sindex, "points", next)
        }
        const listRows = slave.points.map((point, pindex) =>
            <tr key={pindex} className='align-middle'>
                <td >{pindex + 1}</td>
                <td>
                    <Form.Select value={point.code} onChange={e => setPointProp(pindex, "code", e.target.value)}>
                        <option value="01">Item 1</option>
                        <option value="02">Item 2</option>
                        <option value="03">Item 3</option>
                        <option value="11">Peak</option>
                        <option value="12">Valley</option>
                        <option value="21">Alarm 1</option>
                        <option value="22">Alarm 2</option>
                        <option value="23">Alarm 3</option>
                        <option value="24">Alarm 4</option>
                    </Form.Select>
                </td>
                <td>
                    <Form.Control type="text" placeholder="Point Name"
                        value={point.name} onChange={e => setPointProp(pindex, "name", e.target.value)} />
                </td>
                <td>
                    <Button variant='outline-danger' size="sm" onClick={() => delPoint(pindex)}
                        title="Delete Point" disabled={slave.points.length < 2}>
                        <FontAwesomeIcon icon={faTimes} />
                    </Button>
                </td>
            </tr>
        )
        return (
            <Tab key={sindex} eventKey={"tab" + sindex} title={"Slave " + slave.address}>
                <Row>
                    <Col xs={2}>
                        <FloatingLabel label="Slave ID">
                            <Form.Control type="number" min="1" max="65535"
                                value={slave.address} onChange={e => setSlaveProp(sindex, "address", e.target.value, e)} />
                        </FloatingLabel>
                    </Col>
                    <Col xs={2}>
                        <FloatingLabel label="Decimal Digits">
                            <Form.Control type="number" min="0" max="6"
                                value={slave.decimals} onChange={e => setSlaveProp(sindex, "decimals", e.target.value, e)} />
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
                            <th>Register Name</th>
                            <th>Point Name</th>
                            <th>
                                <Button variant='outline-primary' size="sm" onClick={addPoint}
                                    title="Add Point">
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

export default {
    ItemIcon,
    ItemEditor,
    ItemInitial,
}
