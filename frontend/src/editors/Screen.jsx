import React, { useState, useEffect, useRef } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import InputGroup from 'react-bootstrap/InputGroup'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons'
import { faAnglesLeft } from '@fortawesome/free-solid-svg-icons'
import { useResizeDetector } from 'react-resize-detector'

function ExportedEditor(props) {
    return props.show ? (<Editor {...props} />) : null
}

function initialState() {
    return {
    }
}

function initialSett() {
    return {
        scale: 'fit', align: 'center',
        width: '640', height: '480',
        gridX: '10', gridY: '10',
        bgColor: "#FFFFFF"
    }
}

function calcAlign(align, d, D) {
    switch (align) {
        case 'start': return 0
        case 'center': return (D - d) / 2
        case 'end': return (D - d)
    }
}

function fixNum(v) {
    v = v || 0
    return isFinite(v) ? v : 0;
}

function calcGeom(parent, sett) {
    const align = sett.align
    const W = Number(sett.width)
    const H = Number(sett.height)
    const gx = Number(sett.gridX)
    const gy = Number(sett.gridY)
    const pr = parent.pw / parent.ph
    const sx = W / gx
    const sy = H / gy
    let w = W
    let h = H
    let x = 0
    let y = 0
    switch (sett.scale) {
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
    x = fixNum(x)
    y = fixNum(y)
    w = fixNum(w)
    h = fixNum(h)
    const vb = `${x} ${y} ${w} ${h}`
    return { x, y, w, h, gx, gy, sx, sy, W, H, vb }
}

//mouser scroll conflicts with align setting, 
//better to provide a separate window preview link
function SvgWindow({ sett }) {
    //size reported here grows with svg content/viewBox
    //generated size change events are still valuable
    const { ref } = useResizeDetector()
    let cw = 1
    let ch = 1
    if (ref.current) {
        // size reported here is stable
        const style = window.getComputedStyle(ref.current)
        cw = Number(style.getPropertyValue("width").replace("px", ""))
        ch = Number(style.getPropertyValue("height").replace("px", ""))
    }
    const parent = { pw: cw, ph: ch }
    const { H, W, vb, sx, sy } = calcGeom(parent, sett)
    return (<svg ref={ref} width="100%" height="100%" overflow="scroll">
        <rect width="100%" height="100%" fill="none" stroke="gray" strokeWidth="1" />
        <svg width="100%" height="100%" viewBox={vb} preserveAspectRatio='none'>
            <defs>
                <pattern id="grid" width={sx} height={sy} patternUnits="userSpaceOnUse">
                    <path d={`M ${sx} 0 L 0 0 0 ${sy}`} fill="none" stroke="gray" stroke-width="1" />
                </pattern>
            </defs>
            <rect width={W} height={H} fill={sett.bgColor} stroke="gray" strokeWidth="1" />
            <rect width={W} height={H} fill="url(#grid)" />
        </svg>
    </svg >)
}

function LeftPanel() {
    const [show, setShow] = useState(true)
    return show ? (
        <Card>
            <Card.Header>Components
                <Button variant='link' size="sm" onClick={() => setShow(false)} title="Hide">
                    <FontAwesomeIcon icon={faAnglesLeft} />
                </Button>
            </Card.Header>
            <ListGroup variant="flush">
                <ListGroup.Item>Wire Frame</ListGroup.Item>
                <ListGroup.Item>Wire Frame</ListGroup.Item>
                <ListGroup.Item>Wire Frame</ListGroup.Item>
            </ListGroup>
        </Card>) : (
        <Button variant='link' size="sm" onClick={() => setShow(true)} title="Components">
            <FontAwesomeIcon icon={faAnglesRight} />
        </Button>
    )
}

function RightPanel({ sett, setProp }) {
    const [show, setShow] = useState(true)
    return show ? (
        <Card>
            <Card.Header>
                <Button variant='link' size="sm" onClick={() => setShow(false)} title="Hide">
                    <FontAwesomeIcon icon={faAnglesRight} />
                </Button>Settings
            </Card.Header>
            <ListGroup variant="flush">
                <ListGroup.Item>
                    <FloatingLabel label="Scale">
                        <Form.Select size="sm" value={sett.scale} onChange={e => setProp("scale", e.target.value)}>
                            <option value="fit">Fit</option>
                            <option value="fit-width">Fit Width</option>
                            <option value="fit-height">Fit Height</option>
                            <option value="stretch">Stretch</option>
                        </Form.Select>
                    </FloatingLabel>
                    <FloatingLabel label="Align">
                        <Form.Select size="sm" value={sett.align} onChange={e => setProp("align", e.target.value)}>
                            <option value="start">Start</option>
                            <option value="center">Center</option>
                            <option value="end">End</option>
                        </Form.Select>
                    </FloatingLabel>
                    <FloatingLabel label="Width">
                        <Form.Control type="number" required min="1" value={sett.width} onChange={e => setProp("width", e.target.value)} />
                    </FloatingLabel>
                    <FloatingLabel label="Height">
                        <Form.Control type="number" min="1" value={sett.height} onChange={e => setProp("height", e.target.value)} />
                    </FloatingLabel>
                    <FloatingLabel label="Grid X">
                        <Form.Control type="number" min="1" max="100" value={sett.gridX} onChange={e => setProp("gridX", e.target.value)} />
                    </FloatingLabel>
                    <FloatingLabel label="Grid Y">
                        <Form.Control type="number" min="1" max="100" value={sett.gridY} onChange={e => setProp("gridY", e.target.value)} />
                    </FloatingLabel>
                    <InputGroup>
                        <Form.Control type="color" label="Background Color" value={sett.bgColor} onChange={e => setProp("bgColor", e.target.value)} />
                        <Button variant="outline-secondary" disabled>Background Color</Button>
                    </InputGroup>
                </ListGroup.Item>
            </ListGroup>
        </Card>) : (
        <Button variant='link' size="sm" onClick={() => setShow(true)} title="Settings">
            <FontAwesomeIcon icon={faAnglesLeft} />
        </Button>
    )
}

function Editor(props) {
    const [sett, setSett] = useState(() => initialSett())
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
        const next = { ...sett }
        next[name] = value
        setSett(next)
    }
    return (
        <Row className="h-100">
            <Col md="auto">
                <LeftPanel />
            </Col>
            <Col className="gx-0 bg-light">
                <SvgWindow sett={sett} />
            </Col>
            <Col md="auto">
                <RightPanel sett={sett} setProp={setProp} />
            </Col>
        </Row>
    )
}

export {
    ExportedEditor as ScreenEditor,
    initialState as ScreenInitial,
}
