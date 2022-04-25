import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import Table from 'react-bootstrap/Table'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

function ExportedEditor(props) {
    return props.show ? (<Editor {...props} />) : null
}

function initialState() {
    return {
    }
}
function Editor(props) {
    // initialize local state
    useEffect(() => {
        const init = initialState()
        const state = props.state
    }, [props.state])
    // rebuild and store state
    useEffect(() => {
        let valid = true
        props.setValid(valid)
        props.store({})
    }, [props])
    return (
        <Row className="h-100">
            <Col xs={3}>
                <Card>
                    <Card.Header>Components</Card.Header>
                    <ListGroup variant="flush">
                        <ListGroup.Item>Wire Frame</ListGroup.Item>
                        <ListGroup.Item>Wire Frame</ListGroup.Item>
                        <ListGroup.Item>Wire Frame</ListGroup.Item>
                    </ListGroup>
                </Card>
            </Col>
            <Col className="bg-light">
                Preview
            </Col>
            <Col xs={3}>
                <Card>
                    <Card.Header>Settings</Card.Header>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <FloatingLabel label="Scale">
                                <Form.Select size="sm">
                                    <option value="fit">Fit</option>
                                    <option value="fit-width">Fit Width</option>
                                    <option value="fit-height">Fit Height</option>
                                    <option value="stretch">Stretch</option>
                                </Form.Select>
                            </FloatingLabel>
                            <FloatingLabel label="Aspect Ratio">
                                <Form.Select size="sm">
                                    <option value="custom">Custom</option>
                                    <option value="1.33">4:3 Fullscreen</option>
                                    <option value="1.78">16:9 Widescreen</option>
                                </Form.Select>
                            </FloatingLabel>
                            <FloatingLabel label="Width/Height">
                                <Form.Control type="number" min="0.25" max="4" />
                            </FloatingLabel>
                            <FloatingLabel label="Snap Grid X">
                                <Form.Control type="number" min="5" max="100" step="5" />
                            </FloatingLabel>
                            <FloatingLabel label="Snap Grid Y">
                                <Form.Control type="number" min="5" max="100" step="5" />
                            </FloatingLabel>
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    )
}

export {
    ExportedEditor as ScreenEditor,
    initialState as ScreenInitial,
}
