import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'

function FormEntry({ label, children }) {
    return (<Form.Group as={Row}>
        <Form.Label column >{label}</Form.Label>
        <Col style={{ flex: "0 0 16em" }}>
            {children}
        </Col>
    </Form.Group>)
}

export { FormEntry }
