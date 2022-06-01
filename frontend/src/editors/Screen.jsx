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
import { faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { faAnglesUp } from '@fortawesome/free-solid-svg-icons'
import { faAnglesDown } from '@fortawesome/free-solid-svg-icons'
import { faClone } from '@fortawesome/free-solid-svg-icons'
import { useResizeDetector } from 'react-resize-detector'
// import debounceRender from "react-debounce-render"
import { FormEntry } from '../controls/Tools'
import Points from '../common/Points'
import Controls from './Controls'
import Initial from './Screen.js'
import Check from './Check'

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
        cleanup: function () { },
        frame: {},
    }
}

//mouser scroll conflicts with align setting, 
//better to provide a separate window preview link
function SvgWindow({ setts, controls, selected, setSelected, setCSetts, preview, actionControl }) {
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
    const invertedBgBw = invertColor(setts.bgColor, false)
    function controlRender(control, index) {
        const cetts = Initial.fixCSetts(control.setts)
        //always draw them inside
        const mpos = { posX: gx - cetts.width, posY: gy - cetts.height }
        mpos.posX = mpos.posX < 0 ? 0 : mpos.posX
        mpos.posY = mpos.posY < 0 ? 0 : mpos.posY
        cetts.posX = cetts.posX > mpos.posX ? mpos.posX : cetts.posX
        cetts.posY = cetts.posY > mpos.posY ? mpos.posY : cetts.posY
        const x = cetts.posX * sx
        const y = cetts.posY * sy
        const w = cetts.width * sx
        const h = cetts.height * sy
        //requires fill != "none" transparent bg achievable with fillOpacity="0"
        function onClickControl(event) {
            //prevent screen click and selection clear
            event.stopPropagation()
        }
        function onPointerDown(event, index, control) {
            //only on left button = 0
            if (event.button) return;
            const setts = control.setts
            const posX = Number(setts.posX)
            const posY = Number(setts.posY)
            const width = Number(setts.width)
            const height = Number(setts.height)
            const point = svgCoord(ref.current, event)
            setOffset({ x: point.posX - posX, y: point.posY - posY })
            const cleanup = function () {
                setDragged(initialDragged())
                event.target.releasePointerCapture(event.pointerId)
            }
            const frame = JSON.parse(JSON.stringify(control))
            setDragged({ index, control, cleanup, frame, width, height })
            event.target.setPointerCapture(event.pointerId)
            //firefox click never fires
            //last change in control settings is applied
            //to newly selected control if selected right away
            //select on timeout to sync Checks.props blur
            //do not select anywhere else
            setTimeout(() => setSelected({ index, control }), 0)
        }
        function fixMinMax(p, min, max) {
            if (p < min) return min
            if (p > max) return max
            return p
        }
        function svgCoord(el, e, o) {
            o = o || { x: 0, y: 0 }
            //unreliable to drag beyond the right and bottom edges
            const maxX = gx - dragged.width
            const maxY = gy - dragged.height
            const box = el.getBoundingClientRect()
            const clientX = e.clientX - box.left
            const clientY = e.clientY - box.top
            const svgX = vp.x + clientX * vp.w / cw
            const svgY = vp.y + clientY * vp.h / ch
            const posX = fixMinMax(Math.trunc(svgX / sx - o.x), 0, maxX)
            const posY = fixMinMax(Math.trunc(svgY / sy - o.y), 0, maxY)
            return { svgX, svgY, posX, posY }
        }
        function moveControl(event, final) {
            const point = svgCoord(ref.current, event, offset)
            point.posX = `${point.posX}`
            point.posY = `${point.posY}`
            const frame = dragged.frame
            //strings required to pass fix validation above
            frame.setts = { ...frame.setts, ...point }
            setDragged({ ...dragged, frame })
            if (final) {
                const control = dragged.control
                //prevent unexpected updates
                if (cetts.posX !== point.posX) setCSetts(control, 'posX', point.posX)
                if (cetts.posY !== point.posY) setCSetts(control, 'posY', point.posY)
            }
        }
        function onPointerMove(event) {
            if (dragged.index >= 0) {
                moveControl(event, false)
            }
        }
        function onPointerUp(event) {
            if (dragged.index >= 0) {
                moveControl(event, true)
                dragged.cleanup()
            }
        }
        //apple trackpads gestures generate capture losses
        //that prevented dropping because up event never came
        //when that happen, moves are received with index!=dragged.index
        function onLostPointerCapture(event) {
            if (dragged.index >= 0) {
                moveControl(event, true)
                dragged.cleanup()
            }
        }
        //onKeyPress wont receive arrows
        function onKeyDown(event) {
            switch (event.code) {
                case "Delete": {
                    actionControl('del', control)
                    break
                }
                case "ArrowDown": {
                    if (event.shiftKey) actionControl('down', control)
                    else if (event.ctrlKey) actionControl('bottom', control)
                    else if (event.altKey) actionControl('hinc', control)
                    else actionControl('yinc', control)
                    break
                }
                case "ArrowUp": {
                    if (event.shiftKey) actionControl('up', control)
                    else if (event.ctrlKey) actionControl('top', control)
                    else if (event.altKey) actionControl('hdec', control)
                    else actionControl('ydec', control)
                    break
                }
                case "ArrowLeft": {
                    if (event.altKey) actionControl('wdec', control)
                    else actionControl('xdec', control)
                    break
                }
                case "ArrowRight": {
                    if (event.altKey) actionControl('winc', control)
                    else actionControl('xinc', control)
                    break
                }
            }
        }
        const size = { width: w, height: h }
        const isSelected = selected.control === control
        const strokeWidth = isSelected ? "4" : "2"
        const controller = Controls.getController(control.type)
        const controlInstance = controller.Renderer({ control, size })
        const isDragged = dragged.index === index || index < 0
        const fillOpacity = isDragged ? "0.5" : "0"
        const controlBorder = !preview ? (
            <rect width="100%" height="100%" fill="white" fillOpacity={fillOpacity}
                stroke={invertedBgBw} strokeWidth={strokeWidth} strokeOpacity="0.2" />) : null
        const controlEvents = index >= 0 ? {
            onPointerDown: (e) => onPointerDown(e, index, control),
            onPointerMove: (e) => onPointerMove(e),
            onPointerUp: (e) => onPointerUp(e),
            onClick: (e) => onClickControl(e, index, control),
            onLostPointerCapture: (e) => onLostPointerCapture(e),
            onKeyDown: (e) => onKeyDown(e),
        } : {}
        //setting tabIndex adds a selection border that extends to the inner contents
        //tabIndex required to receive keyboard events
        const key = control.id
        return (
            <svg key={key} x={x} y={y} tabIndex={index}
                width={w} height={h} className="draggable"
                {...controlEvents}>
                {controlInstance}
                {controlBorder}
            </svg>
        )
    }
    const controlList = controls.map(controlRender)
    function onClickScreen() {
        setSelected(Initial.selected())
    }
    const gridRect = !preview ? (<rect width={W} height={H} fill="url(#grid)" fillOpacity="0.1" />) : null
    const dragFrame = dragged.index >= 0 ? controlRender(dragged.frame, -1) : null
    return (<svg ref={ref} width="100%" height="100%" onClick={() => onClickScreen()}>
        <rect width="100%" height="100%" fill="none" stroke="gray" strokeWidth="1" strokeOpacity="0.4" />
        <svg width="100%" height="100%" viewBox={vb} preserveAspectRatio='none'>
            <defs>
                <pattern id="grid" width={sx} height={sy} patternUnits="userSpaceOnUse">
                    <path d={`M ${sx} 0 L 0 0 0 ${sy}`} fill="none"
                        stroke={invertedBg} strokeWidth="1" />
                </pattern>
            </defs>
            <rect width={W} height={H} fill={setts.bgColor} stroke="gray" strokeWidth="1" strokeOpacity="0.4" />
            {gridRect}
            {controlList}
            {dragFrame}
        </svg>
    </svg >)
}

function LeftPanel({ show, setShow, addControl }) {
    const controlList = Controls.registeredMapper((controller, index) => {
        return (<ListGroup.Item action key={index}
            title={`Add new ${controller.Type}`}
            onClick={() => addControl(controller)}>
            {controller.Type}</ListGroup.Item>)
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

function ScreenEditor({ setShow, setts, setSetts, preview, globals }) {
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    function settsProps(prop) {
        function setter(name) {
            return function (value) {
                setts[name] = value
                setSetts({ ...setts })
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.labels[prop]
        args.hint = Initial.hints[prop]
        args.getter = () => setts[prop]
        args.setter = setter(prop)
        args.check = Initial.checks[prop]
        args.defval = Initial.setts()[prop]
        return Check.props(args)
    }
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
                    <FormEntry label={Initial.labels.password}>
                        <Form.Control type="password" {...settsProps("password")} />
                    </FormEntry>
                    <FormEntry label={Initial.labels.period}>
                        <Form.Control type="number" {...settsProps("period")} min="1" step="1" />
                    </FormEntry>
                    <FormEntry label={Initial.labels.scale}>
                        <Form.Select {...settsProps("scale")}>
                            <option value="fit">Fit</option>
                            {/* <option value="fit-width">Fit Width</option>
                            <option value="fit-height">Fit Height</option> */}
                            <option value="stretch">Stretch</option>
                        </Form.Select>
                    </FormEntry>
                    <FormEntry label={Initial.labels.align}>
                        <Form.Select {...settsProps("align")}>
                            <option value="start">Start</option>
                            <option value="center">Center</option>
                            <option value="end">End</option>
                        </Form.Select>
                    </FormEntry>
                    <FormEntry label={Initial.labels.width}>
                        <Form.Control type="number" {...settsProps("width")} min="1" step="1" />
                    </FormEntry>
                    <FormEntry label={Initial.labels.height}>
                        <Form.Control type="number" {...settsProps("height")} min="1" step="1" />
                    </FormEntry>
                    <FormEntry label={Initial.labels.gridX}>
                        <Form.Control type="number" {...settsProps("gridX")} min="1" step="1" />
                    </FormEntry>
                    <FormEntry label={Initial.labels.gridY}>
                        <Form.Control type="number" {...settsProps("gridY")} min="1" step="1" />
                    </FormEntry>
                    <FormEntry label={Initial.labels.bgColor}>
                        <InputGroup>
                            <Form.Control type="color" {...settsProps("bgColor")} />
                            <Form.Control type="text" {...settsProps("bgColor")} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label={Initial.labels.hvColor}>
                        <InputGroup>
                            <Form.Control type="color" {...settsProps("hvColor")} />
                            <Form.Control type="text" {...settsProps("hvColor")} />
                        </InputGroup>
                    </FormEntry>
                </ListGroup.Item>
            </ListGroup>
        </Card>)
}

function ControlEditor({ setShow, selected, setCSetts, actionControl,
    setDataProp, preview, globals }) {
    const { control } = selected
    const setts = control.setts
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    const controller = Controls.getController(control.type)
    const dataSetProp = (name, value, e) => setDataProp(control, name, value, e)
    const editor = controller.Editor ? controller.Editor({ control, setProp: dataSetProp, globals }) : null
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
    function settsProps(prop) {
        function setter(name) {
            return function (value) {
                setCSetts(control, name, value)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.clabels[prop]
        args.hint = Initial.chints[prop]
        args.getter = () => setts[prop]
        args.setter = setter(prop)
        args.check = Initial.cchecks[prop]
        args.defval = Initial.csetts()[prop]
        return Check.props(args)
    }
    const inputProps = setts["input"] ? <FormEntry label={Initial.clabels.inputScale}>
        <Row className="gx-0">
            <Col><Form.Control type="number" {...settsProps("inputFactor")} /></Col>
            <Col><Form.Control type="number" {...settsProps("inputOffset")} /></Col>
        </Row>
    </FormEntry> : null
    const promptProp = setts["click"] === "Value Prompt" ? <FormEntry label={Initial.clabels.prompt}>
        <Form.Control type="text" {...settsProps("prompt")} />
    </FormEntry> : <FormEntry label={Initial.clabels.value}>
        <Form.Control type="number" {...settsProps("value")} />
    </FormEntry>
    const outputProps = setts["output"] ? <>
        <FormEntry label={Initial.clabels.outputScale}>
            <Row className="gx-0">
                <Col><Form.Control type="number" {...settsProps("outputFactor")} /></Col>
                <Col><Form.Control type="number" {...settsProps("outputOffset")} /></Col>
            </Row>
        </FormEntry>
        <FormEntry label={Initial.clabels.click}>
            <Form.Select {...settsProps("click")} >
                <option value="Fixed Value">Fixed Value</option>
                <option value="Value Prompt">Value Prompt</option>
            </Form.Select>
        </FormEntry>
        {promptProp}
    </> : null
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
                            onClick={() => actionControl('bottom', control)} title="Selected Control To Bottom">
                            <FontAwesomeIcon icon={faAnglesDown} />
                        </Button>
                        <Button variant='outline-secondary' size="sm"
                            onClick={() => actionControl('down', control)} title="Selected Control Down">
                            <FontAwesomeIcon icon={faAngleDown} />
                        </Button>
                        <Button variant='outline-secondary' size="sm"
                            onClick={() => actionControl('up', control)} title="Selected Control Up">
                            <FontAwesomeIcon icon={faAngleUp} />
                        </Button>
                        <Button variant='outline-secondary' size="sm"
                            onClick={() => actionControl('top', control)} title="Selected Control To Top">
                            <FontAwesomeIcon icon={faAnglesUp} />
                        </Button>
                        &nbsp;&nbsp;
                        <Button variant='outline-secondary' size="sm"
                            onClick={() => actionControl('clone', control)} title="Clone Selected Control">
                            <FontAwesomeIcon icon={faClone} />
                        </Button>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <FormEntry label={Initial.clabels.position}>
                            <Row className="gx-0">
                                <Col><Form.Control type="number" {...settsProps("posX")} min="0" step="1" /></Col>
                                <Col><Form.Control type="number" {...settsProps("posY")} min="0" step="1" /></Col>
                            </Row>
                        </FormEntry>
                        <FormEntry label={Initial.clabels.dimensions}>
                            <Row className="gx-0">
                                <Col><Form.Control type="number" {...settsProps("width")} min="1" step="1" /></Col>
                                <Col><Form.Control type="number" {...settsProps("height")} min="1" step="1" /></Col>
                            </Row>
                        </FormEntry>
                        <FormEntry label={Initial.clabels.title}>
                            <Form.Control type="text" {...settsProps("title")} />
                        </FormEntry>
                        <FormEntry label={Initial.clabels.input}>
                            <Form.Select {...settsProps("input")} >
                                <option value=""></option>
                                {Points.options(globals.inputs)}
                            </Form.Select>
                        </FormEntry>
                        {inputProps}
                        <FormEntry label={Initial.clabels.output}>
                            <Form.Select {...settsProps("output")} >
                                <option value=""></option>
                                {Points.options(globals.outputs)}
                            </Form.Select>
                        </FormEntry>
                        {outputProps}
                    </ListGroup.Item>
                </ListGroup>
            </Card>
            {controlEditor}
        </>
    )
}

function RightPanel({ show, setShow, setts, setSetts, selected, actionControl,
    setCSetts, setDataProp, preview, globals }) {
    const screenEditor = <ScreenEditor
        setShow={setShow}
        setts={setts}
        setSetts={setSetts}
        preview={preview}
        globals={globals}
    />
    const controlEditor = <ControlEditor
        setShow={setShow}
        selected={selected}
        setCSetts={setCSetts}
        actionControl={actionControl}
        setDataProp={setDataProp}
        preview={preview}
        globals={globals}
    />
    return show ? (selected.index >= 0 ? controlEditor : screenEditor) : (
        <Button variant='link' size="sm" onClick={() => setShow(true)} title="Settings">
            <FontAwesomeIcon icon={faAnglesLeft} />
        </Button>
    )
}

function PreviewControl({ preview, setPreview }) {
    //checkbox valignment was tricky
    return (<span className="float-end d-flex align-items-center">
        <Form.Check type="switch" checked={preview} onChange={e => setPreview(e.target.checked)}
            title="Toggle Preview Mode">
        </Form.Check>
    </span>)
}

// const DebouncedSvgWindow = debounceRender(SvgWindow, 100, {
//     leading: true,
// })

function Editor(props) {
    const [setts, setSetts] = useState(Initial.config().setts)
    const [controls, setControls] = useState(Initial.config().controls)
    const [selected, setSelected] = useState(Initial.selected())
    const [preview, setPreview] = useState(false)
    const [right, setRight] = useState(true)
    const [left, setLeft] = useState(true)
    useEffect(() => {
        const config = props.config
        setSetts(config.setts)
        setControls(config.controls)
        setSelected(Initial.selected())
    }, [props.id]) //primitive type required
    useEffect(() => {
        if (props.id) { //required to prevent closing validations
            const inputs = controls.reduce((inputs, control) => {
                const input = control.setts.input
                if (input.trim().length > 0) {
                    inputs.push(input)
                }
                return inputs
            }, [])
            const config = { setts, controls, inputs }
            const valid = Check.run(() => Initial.validator(config))
            props.setter({ config, valid })
        }
    }, [setts, controls])
    function setCSetts(control, name, value) {
        const next = [...controls]
        control.setts[name] = value
        setControls(next)
    }
    function setDataProp(control, name, value) {
        const next = [...controls]
        control.data[name] = value
        setControls(next)
    }
    function addControl(controller) {
        const next = [...controls]
        const control = Initial.control()
        control.setts.width = Math.max(1, Math.trunc(setts.gridX / 10)).toString()
        control.setts.height = Math.max(1, Math.trunc(setts.gridY / 10)).toString()
        const index = next.length
        control.type = controller.Type
        if (controller.Init) {
            control.data = controller.Init()
        }
        next.push(control)
        setControls(next)
        setSelected({ index, control })
    }
    function moduleIndex(index) {
        const total = controls.length
        return (index + total) % total
    }
    function rangeValue(curr, inc, min, max, size) {
        const upper = Number(max) - Number(size)
        const value = Number(curr) + inc
        const trimmed = Math.max(min, Math.min(upper, value))
        return trimmed.toString()
    }
    function actionControl(action, control) {
        switch (action) {
            case "del": {
                const next = [...controls]
                const index = next.indexOf(control)
                next.splice(index, 1)
                setControls(next)
                if (control === selected.control) {
                    setSelected(Initial.selected())
                }
                break
            }
            case "up": {
                const next = [...controls]
                const index = next.indexOf(control)
                next.splice(index, 1)
                next.splice(moduleIndex(index + 1), 0, control)
                setControls(next)
                break
            }
            case "down": {
                const next = [...controls]
                const index = next.indexOf(control)
                next.splice(index, 1)
                next.splice(moduleIndex(index - 1), 0, control)
                setControls(next)
                break
            }
            case "top": {
                const next = [...controls]
                const index = next.indexOf(control)
                next.splice(index, 1)
                next.splice(next.length, 0, control)
                setControls(next)
                break
            }
            case "bottom": {
                const next = [...controls]
                const index = next.indexOf(control)
                next.splice(index, 1)
                next.splice(0, 0, control)
                setControls(next)
                break
            }
            case "clone": {
                const next = [...controls]
                next.push(JSON.parse(JSON.stringify(control)))
                setControls(next)
                break
            }
            case "xdec": {
                setCSetts(control, "posX", rangeValue(control.setts.posX, -1, 0, setts.gridX, control.setts.width))
                break
            }
            case "xinc": {
                setCSetts(control, "posX", rangeValue(control.setts.posX, +1, 0, setts.gridX, control.setts.width))
                break
            }
            case "ydec": {
                setCSetts(control, "posY", rangeValue(control.setts.posY, -1, 0, setts.gridY, control.setts.height))
                break
            }
            case "yinc": {
                setCSetts(control, "posY", rangeValue(control.setts.posY, +1, 0, setts.gridY, control.setts.height))
                break
            }
            case "wdec": {
                setCSetts(control, "width", rangeValue(control.setts.width, -1, 1, setts.gridX, control.setts.posX))
                break
            }
            case "winc": {
                setCSetts(control, "width", rangeValue(control.setts.width, +1, 1, setts.gridX, control.setts.posX))
                break
            }
            case "hdec": {
                setCSetts(control, "height", rangeValue(control.setts.height, -1, 1, setts.gridY, control.setts.posY))
                break
            }
            case "hinc": {
                setCSetts(control, "height", rangeValue(control.setts.height, +1, 1, setts.gridY, control.setts.posY))
                break
            }
        }
    }
    const rightStyle = right ? { flex: "0 0 32em", overflowY: "auto" } : {}
    const leftStyle = left ? { flex: "0 0 12em", overflowY: "auto" } : {}
    const previewControl = <PreviewControl
        preview={preview}
        setPreview={setPreview}
    />
    return (
        <Row className="h-100">
            <Col sm="auto" style={leftStyle} className="mh-100">
                <LeftPanel addControl={addControl} show={left} setShow={setLeft} />
            </Col>
            <Col className="gx-0 bg-light">
                <SvgWindow setts={setts} controls={controls} setCSetts={setCSetts}
                    selected={selected} setSelected={setSelected} preview={preview}
                    actionControl={actionControl} />
            </Col>
            <Col sm="auto" style={rightStyle} className="mh-100">
                <RightPanel
                    show={right}
                    setShow={setRight}
                    setts={setts}
                    setSetts={setSetts}
                    selected={selected}
                    actionControl={actionControl}
                    setCSetts={setCSetts}
                    setDataProp={setDataProp}
                    preview={previewControl}
                    globals={props.globals}
                />
            </Col>
        </Row>
    )
}

export default Editor
