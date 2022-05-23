import React from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import InputGroup from 'react-bootstrap/InputGroup'
import Clipboard from '../tools/Clipboard'
import numeral from 'numeral'
import { useApp } from '../App'

function View() {
    const app = useApp()
    function pointId(name) { return `${app.state.id} ${name}` }
    function onCopyId(point) {
        Clipboard.copyText(point)
    }
    function onGetInput(point) {
        const id = btoa(point)
        window.open(`api/input?id=${id}`, '_blank').focus();
    }
    function onGetOutput(point) {
        const id = btoa(point)
        window.open(`api/output?id=${id}`, '_blank').focus();
    }
    function formatFloat(value) {
        if (value == null) return null; //for outputs
        //ignore any digit beyond 8th decimal position
        //remove trailing zeros and decimal dot it present
        return numeral(value).format("#.########").replace(/(\.?0*$)/, '')
    }
    const inputRows = app.state.inames.map((name, index) => {
        const point = pointId(name)
        return <tr key={index} className="align-middle">
            <td title={point}>{name}</td>
            <td>{formatFloat(app.state.ivalues[name])}</td>
            <td>
                <Dropdown as={ButtonGroup}>
                    <Button variant="link" onClick={() => onGetInput(point)}>
                        GET
                    </Button>
                    <Dropdown.Toggle split variant="link" />
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => onCopyId(point)}>Copy ID</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </td>
        </tr>
    })
    const outputRows = app.state.onames.map((name, index) => {
        const point = pointId(name)
        const ovalue = app.state.ovalues[name]
        const value = app.state.values[name]
        const disabled = !(typeof value === 'string' && value.trim().length > 0 && isFinite(value))
        function onSend(value) {
            value = Number(value) //support 0xFF
            app.send({ name: "write", args: { name, value } })
        }
        function setValue(value) {
            app.dispatch({ name: "value", args: { name, value } })
        }
        return <tr key={index} className="align-middle">
            <td title={point}>{name}</td>
            <td>{formatFloat(ovalue)}</td>
            <td>
                <Row>
                    <Col className='col-8'>
                        <InputGroup>
                            <Form.Control type="text" value={value} onChange={(e) => setValue(e.target.value)}></Form.Control>
                            <Button onClick={() => onSend(value)} disabled={disabled}>Send</Button>
                        </InputGroup>
                    </Col>
                    <Col>
                        <Dropdown as={ButtonGroup}>
                            <Button variant="link" onClick={() => onGetOutput(point)}>
                                GET
                            </Button>
                            <Dropdown.Toggle split variant="link" />
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => onCopyId(point)}>Copy ID</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>
            </td>
        </tr>
    })
    return <Table className='items mt-1' hover>
        <thead>
            <tr>
                <th className="col-4">Point Name</th>
                <th className="col-4">Point Value</th>
                <th className="col-4">Actions</th>
            </tr>
        </thead>
        <tbody>{inputRows}{outputRows}</tbody>
    </Table>
}

export default View
