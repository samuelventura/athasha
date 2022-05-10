import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import InputGroup from 'react-bootstrap/InputGroup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesRight, faRemoveFormat } from '@fortawesome/free-solid-svg-icons'
import { faAnglesLeft } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { faClone } from '@fortawesome/free-solid-svg-icons'
import { useResizeDetector } from 'react-resize-detector'
import { FormEntry } from '../controls/Tools'
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
function SvgWindow({ setts, controls, selected, setSelected, setCSetts, preview }) {
    const fsetts = Initial.fixSetts(setts)
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
    const { H, W, vb, vp, sx, sy, gx, gy } = calcGeom(parent, fsetts)
    const invertedBg = invertColor(fsetts.bgColor, true)
    const invertedBgC = invertColor(fsetts.bgColor, false)
    function controlRender(control, index) {
        const cetts = Initial.fixCSetts(control.setts)
        const x = cetts.posX * sx
        const y = cetts.posY * sy
        const w = cetts.width * sx
        const h = cetts.height * sy
        //requires fill != "none" transparent bg achievable with fillOpacity="0"
        function onClickControl(event, index, control) {
            event.stopPropagation()
            setSelected({ index, control })
        }
        function onPointerDown(e, index, control) {
            const setts = control.setts
            const posX = Number(setts.posX)
            const posY = Number(setts.posY)
            const width = Number(setts.width)
            const height = Number(setts.height)
            const point = svgCoord(ref.current, e)
            setOffset({ x: point.posX - posX, y: point.posY - posY })
            const cleanup = function () {
                setDragged(initialDragged())
                e.target.releasePointerCapture(e.pointerId)
            }
            const frame = JSON.parse(JSON.stringify(control))
            setDragged({ index, control, cleanup, frame, width, height })
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
            //unreliabl to drag beyond the right and bottom edges
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
        function moveControl(e, final) {
            const point = svgCoord(ref.current, e, offset)
            point.posX = `${point.posX}`
            point.posY = `${point.posY}`
            const frame = dragged.frame
            //strings required to pass fix validation above
            frame.setts = { ...frame.setts, ...point }
            setDragged({ ...dragged, frame })
            if (final) {
                const control = dragged.control
                setCSetts(control, 'posX', point.posX)
                setCSetts(control, 'posY', point.posY)
            }
        }
        function onPointerMove(e) {
            if (dragged.index >= 0) {
                moveControl(e, false)
            }
        }
        function onPointerUp(e) {
            if (dragged.index >= 0) {
                moveControl(e, true)
                dragged.cleanup()
            }
        }
        const size = { width: w, height: h }
        const isSelected = selected.control === control
        const borderStroke = isSelected ? "4" : "2"
        const controller = Controls.getController(control.type)
        const controlInstance = controller.Renderer({ control, size })
        const isDragged = dragged.index === index || index < 0
        const borderOpacity = isDragged ? "0.5" : "0"
        const controlBorder = !preview ? (
            <rect width="100%" height="100%" fill="white" fillOpacity={borderOpacity}
                stroke={invertedBgC} strokeWidth={borderStroke} />) : null
        const controlEvents = index >= 0 ? {
            onPointerDown: (e) => onPointerDown(e, index, control),
            onPointerMove: (e) => onPointerMove(e),
            onPointerUp: (e) => onPointerUp(e),
            onClick: (e) => onClickControl(e, index, control),
        } : {}
        return (
            <svg key={index} x={x} y={y} width={w} height={h} className="draggable"
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
    const gridRect = !preview ? (<rect width={W} height={H} fill="url(#grid)" />) : null
    const dragFrame = dragged.index >= 0 ? controlRender(dragged.frame, -1) : null
    return (<svg ref={ref} width="100%" height="100%" onClick={() => onClickScreen()}>
        <rect width="100%" height="100%" fill="none" stroke="gray" strokeWidth="1" />
        <svg width="100%" height="100%" viewBox={vb} preserveAspectRatio='none'>
            <defs>
                <pattern id="grid" width={sx} height={sy} patternUnits="userSpaceOnUse">
                    <path d={`M ${sx} 0 L 0 0 0 ${sy}`} fill="none"
                        stroke={invertedBg} strokeWidth="1" />
                </pattern>
            </defs>
            <rect width={W} height={H} fill={fsetts.bgColor} stroke="gray" strokeWidth="1" />
            {gridRect}
            {controlList}
            {dragFrame}
        </svg>
    </svg >)
}

function LeftPanel({ show, setShow, addControl }) {
    const controlList = Controls.registeredMapper((controler, index) => {
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

function ScreenEditor({ setShow, setts, setSetts, preview }) {
    const [captured, setCaptured] = useState(null)
    function settsProps(prop) {
        function setProp(name) {
            return function (value) {
                const next = { ...setts }
                next[name] = value
                setSetts(next)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.labels[prop]
        args.hint = Initial.hints[prop]
        args.value = setts[prop]
        args.setter = setProp(prop)
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
                        <Form.Control type="number" {...settsProps("period")} />
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
                        <Form.Control type="number" {...settsProps("width")} />
                    </FormEntry>
                    <FormEntry label={Initial.labels.height}>
                        <Form.Control type="number" {...settsProps("height")} />
                    </FormEntry>
                    <FormEntry label={Initial.labels.gridX}>
                        <Form.Control type="number" {...settsProps("gridX")} />
                    </FormEntry>
                    <FormEntry label={Initial.labels.gridY}>
                        <Form.Control type="number" {...settsProps("gridY")} />
                    </FormEntry>
                    <FormEntry label={Initial.labels.bgColor}>
                        <InputGroup>
                            <Form.Control type="color" {...settsProps("bgColor")} />
                            <Form.Control type="text" {...settsProps("bgColor")} />
                        </InputGroup>
                    </FormEntry>
                </ListGroup.Item>
            </ListGroup>
        </Card>)
}

function ControlEditor({ setShow, control, setSetts, maxX, maxY, actionControl,
    setDataProp, preview, globals }) {
    const [captured, setCaptured] = useState(null)
    const setts = control.setts
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
        function setProp(name) {
            return function (value) {
                setSetts(name, value)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.clabels[prop]
        args.hint = Initial.chints[prop]
        args.value = setts[prop]
        args.setter = setProp(prop)
        args.check = Initial.cchecks[prop]
        args.defval = Initial.csetts()[prop]
        return Check.props(args)
    }
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
                        <FormEntry label={Initial.clabels.posX}>
                            <Form.Control type="number" {...settsProps("posX")} />
                        </FormEntry>
                        <FormEntry label={Initial.clabels.posY}>
                            <Form.Control type="number" {...settsProps("posY")} />
                        </FormEntry>
                        <FormEntry label={Initial.clabels.width}>
                            <Form.Control type="number" {...settsProps("width")} />
                        </FormEntry>
                        <FormEntry label={Initial.clabels.height}>
                            <Form.Control type="number" {...settsProps("height")} />
                        </FormEntry>
                    </ListGroup.Item>
                </ListGroup>
            </Card>
            {controlEditor}
        </>
    )
}

function RightPanel({ show, setShow, setts, setSetts, selected, actionControl,
    setCSetts, setDataProp, preview, globals }) {
    const { control } = selected
    const screenEditor = <ScreenEditor
        setShow={setShow}
        setts={setts}
        setSetts={setSetts}
        preview={preview}
    />
    const controlEditor = <ControlEditor
        setShow={setShow}
        control={control}
        setSetts={(name, value) => setCSetts(control, name, value)}
        maxX={setts.gridX - 1}
        maxY={setts.gridY - 1}
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

function PreviewControl({ accept, preview, setPreview, id }) {
    function onUpdate() {
        accept("save-update")
    }
    function onView() {
        window.open(`screen.html?id=${id}`, '_blank').focus();
    }
    //checkbox valignment was tricky
    return (<span className="float-end d-flex align-items-center">
        <Form.Check type="switch" checked={preview} onChange={e => setPreview(e.target.checked)}
            title="Toggle Preview Mode">
        </Form.Check>
        <Button variant='link' size="sm" title="Apply Changes"
            onClick={onUpdate}>
            Update
        </Button>
        <Button variant='link' size="sm" title="Launch Viewer"
            onClick={onView}>
            View
        </Button>
    </span>)
}

function Editor(props) {
    const [setts, setSetts] = useState(Initial.config().setts)
    const [controls, setControls] = useState(Initial.config().controls)
    const [selected, setSelected] = useState(Initial.selected())
    const [preview, setPreview] = useState(false)
    const [right, setRight] = useState(true)
    const [left, setLeft] = useState(true)
    useEffect(() => {
        const init = Initial.config()
        const config = props.config
        setSetts(config.setts || init.setts)
        const previous = config.controls || init.controls
        const upgraded = previous.map(control => {
            const controller = Controls.getController(control.type)
            const upgrade = controller.Upgrade
            if (upgrade) {
                const next = { ...control }
                next.data = upgrade(next.data)
                return next
            }
            return control
        })
        setControls(upgraded)
        setSelected(Initial.selected())
    }, [props.id]) //primitive type required
    useEffect(() => {
        if (props.id) { //required to prevent closing validations
            const points = controls.reduce((points, control) => {
                const pointer = Controls.getController(control.type).Pointer
                if (pointer) {
                    pointer(control.data, (id) => {
                        if (points.indexOf(id) < 0) {
                            points.push(id)
                        }
                    })
                }
                return points
            }, [])
            const config = { setts, controls, points }
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
            setSelected(Initial.selected())
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
    const previewControl = <PreviewControl
        accept={props.accept}
        preview={preview}
        setPreview={setPreview}
        id={props.id}
    />
    return (
        <Row className="h-100">
            <Col sm="auto" style={leftStyle} className="mh-100">
                <LeftPanel addControl={addControl} show={left} setShow={setLeft} />
            </Col>
            <Col className="gx-0 bg-light">
                <SvgWindow setts={setts} controls={controls} setCSetts={setCSetts}
                    selected={selected} setSelected={setSelected} preview={preview} />
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
