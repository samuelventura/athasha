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
import { checkRange } from "./Validation"
import { checkNotBlank } from "./Validation"
import { fixInputValue } from "./Validation"
import ItemIcon from './Dataplot.svg'
import { useApp } from '../App'

function ItemEditor(props) {
    return props.show ? (<Editor {...props} />) : null
}

function ItemInitial() {
    return {
        setts: initialSetts(),
        params: [initialParam("DateTime"), initialParam()],
    }
}

function initialSetts() {
    return {
        host: "127.0.0.1",
        port: "1433",
        database: "datalog",
        username: "sa",
        password: "",
        command: "select DT, COL1 from dbo.Table1 where dt>=@FROM and dt<=@TO",
    }
}

function initialParam(name) {
    return { name: name || "" }
}

function Editor(props) {
    const app = useApp()
    const [setts, setSetts] = useState(ItemInitial().setts)
    const [params, setParams] = useState(ItemInitial().params)
    //initialize local state
    useEffect(() => {
        const init = ItemInitial()
        const state = props.state
        setSetts(state.setts || init.setts)
        setParams(state.params || init.params)
    }, [props.state])
    //rebuild and store state
    useEffect(() => {
        let valid = true
        valid = valid && checkNotBlank(setts.host)
        valid = valid && checkRange(setts.port, 1, 65535)
        valid = valid && params.length > 0
        valid = valid && checkNotBlank(setts.database)
        valid = valid && checkNotBlank(setts.username)
        valid = valid && checkNotBlank(setts.password)
        valid = valid && checkNotBlank(setts.command)
        valid = valid && params.reduce((valid, param) => {
            valid = valid && checkNotBlank(param.name)
            return valid
        }, true)
        props.setValid(valid)
        props.store({ setts, params })
    }, [props, setts, params])
    function setParam(index, name, value, e) {
        const next = [...params]
        const prev = next[index][name]
        value = fixInputValue(e, value, prev)
        next[index][name] = value
        setParams(next)
    }
    function addParam() {
        const next = [...params]
        const param = initialParam()
        next.push(param)
        setParams(next)
    }
    function delParam(index) {
        const next = [...params]
        next.splice(index, 1)
        setParams(next)
    }
    function setProp(name, value, e) {
        const next = { ...setts }
        const prev = next[name]
        value = fixInputValue(e, value, prev)
        next[name] = value
        setSetts(next)
    }
    const rows = params.map((param, index) =>
        <tr key={index} className='align-middle'>
            <td>{index + 1}</td>
            <td>
                {"@" + (index + 1)}
            </td>
            <td>
                <Form.Control type="text" value={param.name}
                    onChange={e => setParam(index, "name", e.target.value)} />
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delParam(index)}>
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </td>
        </tr>
    )
    return (
        <Form>
            <Row>
                <Col xs={4}>
                    <FloatingLabel label="Hostname/IP Address">
                        <Form.Control autoFocus type="text"
                            value={setts.host} onChange={e => setProp("host", e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col xs={2}>
                    <FloatingLabel label="Port">
                        <Form.Control type="number" min="1" max="65535"
                            value={setts.port} onChange={e => setProp("port", e.target.value, e)} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col xs={3}>
                    <FloatingLabel label="Dataplot">
                        <Form.Control autoFocus type="text"
                            value={setts.database} onChange={e => setProp("database", e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col xs={3}>
                    <FloatingLabel label="Username">
                        <Form.Control type="text"
                            value={setts.username} onChange={e => setProp("username", e.target.value)} />
                    </FloatingLabel>
                </Col>
                <Col xs={3}>
                    <FloatingLabel label="Password">
                        <Form.Control type="password"
                            value={setts.password} onChange={e => setProp("password", e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col xs={9}>
                    <FloatingLabel label="Command">
                        <Form.Control autoFocus type="text"
                            value={setts.command} onChange={e => setProp("command", e.target.value)} />
                    </FloatingLabel>
                </Col>
            </Row>

            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Param</th>
                        <th>Name</th>
                        <th>
                            <Button variant='outline-primary' size="sm" onClick={addParam}>
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

export default {
    ItemIcon,
    ItemEditor,
    ItemInitial,
}
