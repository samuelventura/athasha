import React from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
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
    function onGet(point) {
        const id = btoa(point)
        window.open(`api/point?id=${id}`, '_blank').focus();
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
                <Button variant="link" onClick={() => onGet(point)}>GET</Button>
                <Button variant="link" onClick={() => onCopyId(point)}>Copy ID</Button>
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
            app.send({ name: "output", args: { name, value } })
        }
        function setValue(value) {
            app.dispatch({ name: "value", args: { name, value } })
        }
        return <tr key={index} className="align-middle">
            <td title={point}>{name}</td>
            <td>{formatFloat(ovalue)}</td>
            <td>
                <Row>
                    <Col>
                        <InputGroup>
                            <Form.Control type="text" value={value} onChange={(e) => setValue(e.target.value)}></Form.Control>
                            <Button onClick={() => onSend(value)} disabled={disabled}>Send</Button>
                        </InputGroup>
                    </Col>
                    <Col>
                        <Button variant="link" onClick={() => onCopyId(point)}>Copy ID</Button>
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
