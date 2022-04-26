import React, { useState, useEffect, useRef } from 'react'
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
import { useResizeDetector } from 'react-resize-detector';

function ExportedEditor(props) {
    return props.show ? (<Editor {...props} />) : null
}

function initialState() {
    return {
    }
}

function initialGeom() {
    return { scale: 'fit', align: 'start', width: '640', height: '480', gridX: '10', gridY: '10' }
}

function calcAlign(align, d, D) {
    switch (align) {
        case 'start': return 0
        case 'center': return (D - d) / 2
        case 'end': return (D - d)
    }
}

function calcGeom(parent, geom) {
    const align = geom.align
    const W = Number(geom.width)
    const H = Number(geom.height)
    const gx = Number(geom.gridX)
    const gy = Number(geom.gridY)
    const pr = parent.pw / parent.ph
    const sx = W / gx
    const sy = H / gy
    let w = W
    let h = H
    let x = 0
    let y = 0
    switch (geom.scale) {
        case 'fit': {
            const wr = W / parent.pw
            const hr = H / parent.ph
            const r = wr > hr ? wr : hr
            w = parent.pw * r
            h = parent.ph * r
            x = calcAlign(align, w, W)
            y = calcAlign(align, h, H)
            break
        }
        case 'fit-width': {
            w = W
            h = W / pr
            y = calcAlign(align, h, H)
            break
        }
        case 'fit-height': {
            h = H
            w = H * pr
            x = calcAlign(align, w, W)
            break
        }
    }
    const vb = `${x} ${y} ${w} ${h}`
    return { x, y, w, h, gx, gy, sx, sy, W, H, vb }
}

//TODO FIXME pattern grid, background color picker
function SvgWindow({ geom }) {
    //size reported here grows with svg content/viewBox
    const { ref } = useResizeDetector();
    let cw = 1
    let ch = 1
    if (ref.current) {
        // size reported here is stable
        const style = window.getComputedStyle(ref.current)
        cw = Number(style.getPropertyValue("width").replace("px", ""))
        ch = Number(style.getPropertyValue("height").replace("px", ""))
    }
    const parent = { pw: cw, ph: ch }
    const { H, W, vb } = calcGeom(parent, geom)
    return (<svg ref={ref} width="100%" height="100%" overflow="scroll">
        <rect width="100%" height="100%" fill="none" stroke="gray" strokeWidth="1" />
        <svg width="100%" height="100%" viewBox={vb} preserveAspectRatio='none'>
            <rect width={W} height={H} fill="white" stroke="gray" strokeWidth="1" />
        </svg>
    </svg >)
}

function SvgScreen({ W, H }) {
    return false ? (<svg width={W} height={H} className="position-absolute">
        <rect width="100%" height="100%" fill="white" stroke="orange" strokeWidth="3" />
    </svg>) : null
}

function Editor(props) {
    const [geom, setGeom] = useState(() => initialGeom())
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
    function setProp(name, value) {
        const next = { ...geom }
        next[name] = value
        setGeom(next)
    }
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
            <Col className="gx-0 bg-light">
                <SvgWindow geom={geom} />
            </Col>
            <Col xs={3}>
                <Card>
                    <Card.Header>Settings</Card.Header>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <FloatingLabel label="Scale">
                                <Form.Select size="sm" value={geom.scale} onChange={e => setProp("scale", e.target.value)}>
                                    <option value="fit">Fit</option>
                                    <option value="fit-width">Fit Width</option>
                                    <option value="fit-height">Fit Height</option>
                                    <option value="stretch">Stretch</option>
                                </Form.Select>
                            </FloatingLabel>
                            <FloatingLabel label="Align">
                                <Form.Select size="sm" value={geom.align} onChange={e => setProp("align", e.target.value)}>
                                    <option value="start">Start</option>
                                    <option value="center">Center</option>
                                    <option value="end">End</option>
                                </Form.Select>
                            </FloatingLabel>
                            <FloatingLabel label="Width">
                                <Form.Control type="number" min="1" value={geom.width} onChange={e => setProp("width", e.target.value)} />
                            </FloatingLabel>
                            <FloatingLabel label="Height">
                                <Form.Control type="number" min="1" value={geom.height} onChange={e => setProp("height", e.target.value)} />
                            </FloatingLabel>
                            <FloatingLabel label="Grid X">
                                <Form.Control type="number" min="1" max="100" value={geom.gridX} onChange={e => setProp("gridX", e.target.value)} />
                            </FloatingLabel>
                            <FloatingLabel label="Grid Y">
                                <Form.Control type="number" min="1" max="100" value={geom.gridY} onChange={e => setProp("gridY", e.target.value)} />
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
