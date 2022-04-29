import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import InputGroup from 'react-bootstrap/InputGroup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons'
import { faAnglesLeft } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { faClone } from '@fortawesome/free-solid-svg-icons'
import { useResizeDetector } from 'react-resize-detector'
import { FormEntry } from '../controls/Helper'
import { getController } from './Controls'
import { registeredMapper } from './Controls'
import { checkRange } from "./Validation"
import { checkNotBlank } from "./Validation"
import { fixInputValue } from "./Validation"
import { useApp } from '../App'

function ExportedEditor(props) {
    return props.show ? (<Editor {...props} />) : null
}

function initialState() {
    return {
        setts: initialSetts(),
        controls: [],
        points: [],
    }
}

function initialSetts() {
    return {
        scale: 'fit', align: 'center',
        width: '640', height: '480',
        gridX: '10', gridY: '10',
        bgColor: "#ffffff",
        password: "",
    }
}

function initialControl() {
    return {
        type: "none",
        setts: initialControlSetts(),
        data: {},
    }
}

function initialSelected() {
    return {
        index: -1,
        control: {},
    }
}

function initialControlSetts() {
    return {
        posX: '0', posY: '0',
        width: '1', height: '1',
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
    return isFinite(v) ? v : 0
}

function padZero(str, len) {
    len = len || 2
    var zeros = new Array(len).join('0')
    return (zeros + str).slice(-len)
}

function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1)
    }
    //convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.')
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16)
    if (bw) {
        //https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#ffffff'
    }
    //invert color components
    r = (255 - r).toString(16)
    g = (255 - g).toString(16)
    b = (255 - b).toString(16)
    //pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b)
}

function calcGeom(parent, setts) {
    const align = setts.align
    const W = Number(setts.width)
    const H = Number(setts.height)
    const gx = Number(setts.gridX)
    const gy = Number(setts.gridY)
    const pr = parent.pw / parent.ph
    const sx = W / gx
    const sy = H / gy
    let w = W
    let h = H
    let x = 0
    let y = 0
    switch (setts.scale) {
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
    const vp = { x, y, w, h }
    return { gx, gy, sx, sy, W, H, vb, vp }
}

function initialDragged() {
    return {
        index: -1,
        control: {},
        cleanup: function () { }
    }
}

//mouser scroll conflicts with align setting, 
//better to provide a separate window preview link
function SvgWindow({ setts, controls, selected, setSelected, setControlProp, preview }) {
    //size reported here grows with svg content/viewBox
    //generated size change events are still valuable
    const resize = useResizeDetector()
    const [dragged, setDragged] = useState(() => initialDragged())
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const ref = resize.ref
    //prevent false positive drags on resize event after control click
    useEffect(() => { dragged.cleanup() }, [resize.width, resize.height])
    let cw = 1
    let ch = 1
    if (ref.current) {
        //size reported here is stable
        const style = window.getComputedStyle(ref.current)
        cw = Number(style.getPropertyValue("width").replace("px", ""))
        ch = Number(style.getPropertyValue("height").replace("px", ""))
    }
    const parent = { pw: cw, ph: ch }
    const { H, W, vb, vp, sx, sy, gx, gy } = calcGeom(parent, setts)
    const invertedBg = invertColor(setts.bgColor, true)
    const invertedBgC = invertColor(setts.bgColor, false)
    const controlList = controls.map((control, index) => {
        const setts = control.setts
        const x = setts.posX * sx
        const y = setts.posY * sy
        const w = setts.width * sx
        const h = setts.height * sy
        //requires fill != "none" transparent bg achievable with fillOpacity="0"
        function onClickControl(event, index, control) {
            event.stopPropagation()
            setSelected({ index, control })
        }
        function onPointerDown(e, index, control) {
            const setts = control.setts
            const posX = Number(setts.posX)
            const posY = Number(setts.posY)
            const point = svgCoord(ref.current, e)
            setOffset({ x: point.posX - posX, y: point.posY - posY })
            const cleanup = function () {
                setDragged(initialDragged())
                e.target.releasePointerCapture(e.pointerId)
            }
            setDragged({ index, control, cleanup })
            setSelected({ index, control })
            e.target.setPointerCapture(e.pointerId)
        }
        function fixMinMax(p, min, max) {
            if (p < min) return min
            if (p > max) return max
            return p
        }
        function svgCoord(el, e, o) {
            o = o || { x: 0, y: 0 }
            const maxX = gx - 1
            const maxY = gy - 1
            const box = el.getBoundingClientRect()
            const clientX = e.clientX - box.left
            const clientY = e.clientY - box.top
            const svgX = vp.x + clientX * vp.w / cw
            const svgY = vp.y + clientY * vp.h / ch
            const posX = fixMinMax(Math.trunc(svgX / sx - o.x), 0, maxX)
            const posY = fixMinMax(Math.trunc(svgY / sy - o.y), 0, maxY)
            return { svgX, svgY, posX, posY }
        }
        function moveControl(e) {
            const control = dragged.control
            const point = svgCoord(ref.current, e, offset)
            setControlProp(control, 'posX', point.posX)
            setControlProp(control, 'posY', point.posY)
        }
        function onPointerMove(e) {
            if (dragged.index >= 0) {
                moveControl(e)
            }
        }
        function onPointerUp(e) {
            if (dragged.index >= 0) {
                moveControl(e)
                dragged.cleanup()
            }
        }
        const size = { width: w, height: h }
        const isSelected = selected.control === control
        const borderStroke = isSelected ? "4" : "2"
        const controller = getController(control.type)
        const controlInstance = controller.Renderer({ control, size })
        const controlBorder = !preview ? (
            <rect width="100%" height="100%" fill="white" fillOpacity="0"
                stroke={invertedBgC} strokeWidth={borderStroke} />) : null
        return (
            <svg key={index} x={x} y={y} width={w} height={h} className="draggable"
                onPointerDown={e => onPointerDown(e, index, control)}
                onPointerMove={e => onPointerMove(e)} onPointerUp={e => onPointerUp(e)}
                onClick={e => onClickControl(e, index, control)}>
                {controlInstance}
                {controlBorder}
            </svg>
        )
    })
    function onClickScreen() {
        setSelected(initialSelected())
    }
    const gridRect = !preview ? (<rect width={W} height={H} fill="url(#grid)" />) : null
    return (<svg ref={ref} width="100%" height="100%" onClick={() => onClickScreen()}>
        <rect width="100%" height="100%" fill="none" stroke="gray" strokeWidth="1" />
        <svg width="100%" height="100%" viewBox={vb} preserveAspectRatio='none'>
            <defs>
                <pattern id="grid" width={sx} height={sy} patternUnits="userSpaceOnUse">
                    <path d={`M ${sx} 0 L 0 0 0 ${sy}`} fill="none"
                        stroke={invertedBg} strokeWidth="1" />
                </pattern>
            </defs>
            <rect width={W} height={H} fill={setts.bgColor} stroke="gray" strokeWidth="1" />
            {gridRect}
            {controlList}
        </svg>
    </svg >)
}

function LeftPanel({ show, setShow, addControl }) {
    const controlList = registeredMapper((controler, index) => {
        return (<ListGroup.Item action key={index}
            title={`Add new ${controler.Type}`}
            onClick={() => addControl(controler)}>
            {controler.Type}</ListGroup.Item>)
    })
    return show ? (
        <Card>
            <Card.Header>Controls
                <Button variant='link' size="sm" onClick={() => setShow(false)}
                    title="Hide" className="p-0 float-end">
                    <FontAwesomeIcon icon={faAnglesLeft} />
                </Button>
            </Card.Header>
            <ListGroup variant="flush">
                {controlList}
            </ListGroup>
        </Card>) : (
        <Button variant='link' size="sm" onClick={() => setShow(true)} title="Controls">
            <FontAwesomeIcon icon={faAnglesRight} />
        </Button>
    )
}

function ScreenEditor({ setShow, setts, setProp, preview }) {
    //preview saves before launching viewer
    return (
        <Card>
            <Card.Header>
                <Button variant='link' size="sm" onClick={() => setShow(false)} title="Hide">
                    <FontAwesomeIcon icon={faAnglesRight} />
                </Button>Screen Settings
                {preview}
            </Card.Header>
            <ListGroup variant="flush">
                <ListGroup.Item>
                    <FormEntry label="Scale">
                        <Form.Select value={setts.scale} onChange={e => setProp("scale", e.target.value)}>
                            <option value="fit">Fit</option>
                            {/* <option value="fit-width">Fit Width</option>
                            <option value="fit-height">Fit Height</option> */}
                            <option value="stretch">Stretch</option>
                        </Form.Select>
                    </FormEntry>
                    <FormEntry label="Align">
                        <Form.Select value={setts.align} onChange={e => setProp("align", e.target.value)}>
                            <option value="start">Start</option>
                            <option value="center">Center</option>
                            <option value="end">End</option>
                        </Form.Select>
                    </FormEntry>
                    <FormEntry label="Width">
                        <Form.Control type="number" min="1" value={setts.width} onChange={e => setProp("width", e.target.value, e)} />
                    </FormEntry>
                    <FormEntry label="Height">
                        <Form.Control type="number" min="1" value={setts.height} onChange={e => setProp("height", e.target.value, e)} />
                    </FormEntry>
                    <FormEntry label="Grid X">
                        <Form.Control type="number" min="1" max="100" value={setts.gridX} onChange={e => setProp("gridX", e.target.value, e)} />
                    </FormEntry>
                    <FormEntry label="Grid Y">
                        <Form.Control type="number" min="1" max="100" value={setts.gridY} onChange={e => setProp("gridY", e.target.value, e)} />
                    </FormEntry>
                    <FormEntry label="Background">
                        <InputGroup>
                            <Form.Control type="color" value={setts.bgColor} onChange={e => setProp("bgColor", e.target.value)}
                                title={setts.bgColor} />
                            <Form.Control type="text" pattern="#[0-9a-fA-F]{6}" value={setts.bgColor}
                                onChange={e => setProp("bgColor", e.target.value, e)} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label="Password">
                        <Form.Control type="password" value={setts.password}
                            onChange={e => setProp("password", e.target.value)}
                            title={setts.password} />
                    </FormEntry>
                </ListGroup.Item>
            </ListGroup>
        </Card>)
}

function ControlEditor({ setShow, control, setProp, maxX, maxY, actionControl, setDataProp, preview }) {
    const app = useApp()
    const setts = control.setts
    const controller = getController(control.type)
    const dataSetProp = (name, value, e) => setDataProp(control, name, value, e)
    const editor = controller.Editor ? controller.Editor({ control, setProp: dataSetProp, app }) : null
    const controlProps = editor ? (
        <ListGroup variant="flush">
            <ListGroup.Item>
                {editor}
            </ListGroup.Item>
        </ListGroup>) : null
    const controlEditor = (<Card>
        <Card.Header>{control.type}</Card.Header>
        {controlProps}
    </Card>)
    return (
        <>
            <Card>
                <Card.Header>
                    <Button variant='link' size="sm" onClick={() => setShow(false)} title="Hide">
                        <FontAwesomeIcon icon={faAnglesRight} />
                    </Button>
                    Control Settings
                    {preview}
                </Card.Header>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <Button variant='outline-danger' size="sm" className="float-end"
                            onClick={() => actionControl('del', control)} title="Remove Selected Control">
                            <FontAwesomeIcon icon={faTimes} />
                        </Button>
                        <Button variant='outline-secondary' size="sm"
                            onClick={() => actionControl('down', control)} title="Selected Control Down">
                            <FontAwesomeIcon icon={faArrowDown} />
                        </Button>
                        <Button variant='outline-secondary' size="sm"
                            onClick={() => actionControl('up', control)} title="Selected Control Up">
                            <FontAwesomeIcon icon={faArrowUp} />
                        </Button>
                        <Button variant='outline-secondary' size="sm"
                            onClick={() => actionControl('clone', control)} title="Clone Selected Control">
                            <FontAwesomeIcon icon={faClone} />
                        </Button>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <FormEntry label="Position X">
                            <Form.Control type="number" min="0" max={maxX} value={setts.posX} onChange={e => setProp("posX", e.target.value, e)} />
                        </FormEntry>
                        <FormEntry label="Position Y">
                            <Form.Control type="number" min="0" max={maxY} value={setts.posY} onChange={e => setProp("posY", e.target.value, e)} />
                        </FormEntry>
                        <FormEntry label="Width">
                            <Form.Control type="number" min="1" value={setts.width} onChange={e => setProp("width", e.target.value, e)} />
                        </FormEntry>
                        <FormEntry label="Height">
                            <Form.Control type="number" min="1" value={setts.height} onChange={e => setProp("height", e.target.value, e)} />
                        </FormEntry>
                    </ListGroup.Item>
                </ListGroup>
            </Card>
            {controlEditor}
        </>
    )
}

function RightPanel({ show, setShow,
    setts, setProp, selected, actionControl, setControlProp,
    setDataProp, saveForView, valid, preview, setPreview }) {
    const { index, control } = selected
    const screenEditor = <ScreenEditor setShow={setShow} setts={setts} setProp={setProp}
        saveForView={saveForView} valid={valid}
        preview={preview} setPreview={setPreview} />
    const controlEditor = <ControlEditor setShow={setShow} control={control} index={index}
        setProp={(name, value, e) => setControlProp(control, name, value, e)}
        setDataProp={setDataProp} maxX={setts.gridX - 1} maxY={setts.gridY - 1}
        saveForView={saveForView} valid={valid}
        preview={preview} setPreview={setPreview}
        actionControl={actionControl} />
    return show ? (selected.index >= 0 ? controlEditor : screenEditor) : (
        <Button variant='link' size="sm" onClick={() => setShow(true)} title="Settings">
            <FontAwesomeIcon icon={faAnglesLeft} />
        </Button>
    )
}

function PreviewControl({ saveForView, valid, preview, setPreview, id }) {
    function onUpdate() {
        saveForView()
    }
    function onView() {
        window.open(`view.html?id=${id}`, '_blank').focus();
    }
    //checkbox valignment was tricky
    return (<span className="float-end d-flex align-items-center">
        <Form.Check type="switch" checked={preview} onChange={e => setPreview(e.target.checked)}
            title="Toggle Preview Mode">
        </Form.Check>
        <Button variant='link' size="sm" title="Apply Changes"
            disabled={!valid} onClick={onUpdate}>
            Update
        </Button>
        <Button variant='link' size="sm" title="Launch Viewer"
            disabled={!valid} onClick={onView}>
            View
        </Button>
    </span>)
}

function Editor(props) {
    const [setts, setSetts] = useState(initialState().setts)
    const [controls, setControls] = useState(initialState().controls)
    const [selected, setSelected] = useState(() => initialSelected())
    const [preview, setPreview] = useState(false)
    const [right, setRight] = useState(true)
    const [left, setLeft] = useState(true)
    //initialize local state
    useEffect(() => {
        const init = initialState()
        const state = props.state
        setSetts(state.setts || init.setts)
        const previous = state.controls || init.controls
        const upgraded = previous.map(control => {
            const controller = getController(control.type)
            const upgrade = controller.Upgrade
            if (upgrade) {
                const next = { ...control }
                next.data = upgrade(next.data)
                return next
            }
            return control
        })
        setControls(upgraded)
    }, [props.state])
    //rebuild and store state
    useEffect(() => {
        let valid = true
        valid = valid && checkNotBlank(setts.scale)
        valid = valid && checkNotBlank(setts.align)
        valid = valid && checkRange(setts.width, 1)
        valid = valid && checkRange(setts.height, 1)
        valid = valid && checkRange(setts.gridX, 1, 100)
        valid = valid && checkRange(setts.gridY, 1, 100)
        valid = valid && checkNotBlank(setts.bgColor)
        valid = valid && controls.reduce((valid, control) => {
            const validator = getController(control.type).Validator
            if (validator) {
                valid = valid && validator(control)
            }
            return valid
        }, true)
        const points = controls.reduce((points, control) => {
            const pointer = getController(control.type).Pointer
            if (pointer) {
                pointer(control.data, (id) => points.push(id))
            }
            return points
        }, [])
        props.setValid(valid)
        props.store({ setts, controls, points })
    }, [props, setts, controls])
    function setProp(name, value, e) {
        const next = { ...setts }
        const prev = next[name]
        value = fixInputValue(e, value, prev)
        next[name] = value
        setSetts(next)
    }
    function setControlProp(control, name, value, e) {
        const next = [...controls]
        const prev = control.setts[name]
        value = fixInputValue(e, value, prev)
        control.setts[name] = value
        setControls(next)
    }
    function setDataProp(control, name, value, e) {
        const next = [...controls]
        const prev = control.data[name]
        value = fixInputValue(e, value, prev)
        control.data[name] = value
        setControls(next)
    }
    function addControl(controller) {
        const next = [...controls]
        const control = initialControl()
        const index = next.length
        control.type = controller.Type
        if (controller.Init) {
            control.data = controller.Init()
        }
        next.push(control)
        setControls(next)
        setSelected({ index, control })
    }
    function delControl(control) {
        const next = [...controls]
        const index = next.indexOf(control)
        next.splice(index, 1)
        setControls(next)
        if (control === selected.control) {
            setSelected(initialSelected())
        }
    }
    function upControl(control) {
        const next = [...controls]
        const index = next.indexOf(control)
        next.splice(index, 1)
        next.splice(index + 1, 0, control)
        setControls(next)
    }
    function downControl(control) {
        const next = [...controls]
        const index = next.indexOf(control)
        next.splice(index, 1)
        next.splice(index - 1, 0, control)
        setControls(next)
    }
    function cloneControl(control) {
        const next = [...controls]
        next.push(JSON.parse(JSON.stringify(control)))
        setControls(next)
    }
    function actionControl(action, control) {
        switch (action) {
            case "del": {
                delControl(control)
                break
            }
            case "up": {
                upControl(control)
                break
            }
            case "down": {
                downControl(control)
                break
            }
            case "clone": {
                cloneControl(control)
                break
            }
        }
    }
    const rightStyle = right ? { flex: "0 0 28em", overflowY: "auto" } : {}
    const leftStyle = left ? { flex: "0 0 12em", overflowY: "auto" } : {}
    const previewControl = <PreviewControl valid={props.valid} saveForView={props.saveForView}
        preview={preview} setPreview={setPreview} id={props.id} />
    return (
        <Row className="h-100">
            <Col sm="auto" style={leftStyle} className="mh-100">
                <LeftPanel addControl={addControl} show={left} setShow={setLeft} />
            </Col>
            <Col className="gx-0 bg-light">
                <SvgWindow setts={setts} controls={controls} setControlProp={setControlProp}
                    selected={selected} setSelected={setSelected} preview={preview} />
            </Col>
            <Col sm="auto" style={rightStyle} className="mh-100">
                <RightPanel setts={setts} setProp={setProp} selected={selected}
                    actionControl={actionControl} setControlProp={setControlProp}
                    setDataProp={setDataProp} preview={previewControl}
                    show={right} setShow={setRight} />
            </Col>
        </Row>
    )
}

export {
    ExportedEditor as ScreenEditor,
    initialState as ScreenInitial,
}
