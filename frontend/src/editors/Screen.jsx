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
import { FormEntry } from '../controls/Tools'
import Points from '../common/Points'
import Controls from './Controls'
import Initial from './Screen.js'
import Check from '../common/Check'
import Input from "../screen/Input"
import Color from "../common/Color"

function calcAlign(align, d, D) {
    switch (align) {
        case 'Start': return 0
        case 'Center': return (D - d) / 2
        case 'End': return (D - d)
    }
}

function fixNum(v) {
    v = v || 0
    return isFinite(v) ? v : 0
}

function fixMinMax(p, min, max) {
    if (p < min) return min
    if (p > max) return max
    return p
}

function calcGeom(parent, setts) {
    const align = setts.align
    const W = Number(setts.width)
    const H = Number(setts.height)
    const gx = Number(setts.gridX)
    const gy = Number(setts.gridY)
    const sx = W / gx
    const sy = H / gy
    let w = W
    let h = H
    let x = 0
    let y = 0
    switch (setts.scale) {
        case 'Fit': {
            const wr = W / parent.pw
            const hr = H / parent.ph
            const r = wr > hr ? wr : hr
            w = parent.pw * r
            h = parent.ph * r
            x = calcAlign(align, w, W)
            y = calcAlign(align, h, H)
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
        type: "",
        index: -1,
        frame: {},
        control: {},
        offset: { x: 0, y: 0 },
        point: { posX: 0, posY: 0 },
        cleanup: function () { },
        rect: { posX: 0, posY: 0, width: 0, height: 0 },
    }
}

//mouser scroll conflicts with align setting, 
//better to provide a separate window preview link
function SvgWindow({ setts, controls, selected, setSelected, setCSetts, preview, actionControl }) {
    //size reported here grows with svg content/viewBox
    //generated size change events are still valuable
    const resize = useResizeDetector()
    const [dragged, setDragged] = useState(() => initialDragged())
    const [multi, setMulti] = useState({})
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
    const gridColor = Color.invert(setts.backColor, true)
    const borderColor = Color.invert(setts.backColor, true)
    function applyKeyDown(event, control) {
        switch (event.code) {
            case "Delete": {
                actionControl('del', control)
                break
            }
            case "ArrowDown": {
                if (event.altKey) actionControl(event.shiftKey ? 'bottom' : 'down', control)
                else if (event.ctrlKey) actionControl(event.shiftKey ? 'hinc10' : 'hinc', control)
                else if (event.metaKey) actionControl(event.shiftKey ? 'hinc10' : 'hinc', control)
                else actionControl(event.shiftKey ? 'yinc10' : 'yinc', control)
                break
            }
            case "ArrowUp": {
                if (event.altKey) actionControl(event.shiftKey ? 'top' : "up", control)
                else if (event.ctrlKey) actionControl(event.shiftKey ? 'hdec10' : 'hdec', control)
                else if (event.metaKey) actionControl(event.shiftKey ? 'hdec10' : 'hdec', control)
                else actionControl(event.shiftKey ? 'ydec10' : 'ydec', control)
                break
            }
            case "ArrowLeft": {
                if (event.ctrlKey) actionControl(event.shiftKey ? 'wdec10' : 'wdec', control)
                else if (event.metaKey) actionControl(event.shiftKey ? 'wdec10' : 'wdec', control)
                else actionControl(event.shiftKey ? 'xdec10' : 'xdec', control)
                break
            }
            case "ArrowRight": {
                if (event.ctrlKey) actionControl(event.shiftKey ? 'winc10' : 'winc', control)
                else if (event.metaKey) actionControl(event.shiftKey ? 'winc10' : 'winc', control)
                else actionControl(event.shiftKey ? 'xinc10' : 'xinc', control)
                break
            }
        }
    }
    function svgCoord(el, e, r, o) {
        o = o || { x: 0, y: 0 }
        r = r || { width: 0, height: 0 }
        //unreliable to drag beyond the right and bottom edges
        const maxX = gx - r.width
        const maxY = gy - r.height
        //mouse position pixel coordinates
        const box = el.getBoundingClientRect()
        const clientX = e.clientX - box.left
        const clientY = e.clientY - box.top
        //control top-left corner in SVG user coordinates
        const svgX = vp.x + clientX * vp.w / cw
        const svgY = vp.y + clientY * vp.h / ch
        //control top-left corner in grid units
        const posX = fixMinMax(Math.trunc(svgX / sx - o.x), 0, maxX)
        const posY = fixMinMax(Math.trunc(svgY / sy - o.y), 0, maxY)
        return { posX, posY }
    }
    function screenMove(event, final) {
        const point = svgCoord(ref.current, event)
        const box = {}
        box.posX = Math.min(point.posX, dragged.point.posX)
        box.posY = Math.min(point.posY, dragged.point.posY)
        box.width = Math.abs(point.posX - dragged.point.posX)
        box.height = Math.abs(point.posY - dragged.point.posY)
        box.posX2 = box.posX + box.width
        box.posY2 = box.posY + box.height
        const rect = {}
        rect.posX = `${box.posX}`
        rect.posY = `${box.posY}`
        rect.width = `${box.width}`
        rect.height = `${box.height}`
        const frame = dragged.frame
        //strings required to pass fix validation above
        frame.setts = { ...frame.setts, ...rect }
        setDragged({ ...dragged, frame })
        if (final) {
            const next = {}
            controls.forEach(c => {
                const posX = Number(c.setts.posX)
                const posY = Number(c.setts.posY)
                const posX2 = posX + Number(c.setts.width)
                const posY2 = posY + Number(c.setts.height)
                const inter = Math.max(box.posX, posX) < Math.min(box.posX2, posX2) &&
                    Math.max(box.posY, posY) < Math.min(box.posY2, posY2)
                if (inter) next[c.id] = c
            })
            setMulti(next)
        }
    }
    function backPointerDown(event) {
        event.stopPropagation()
        setSelected(Initial.selected())
        setMulti({})
    }
    function screenPointerDown(event, type) {
        event.stopPropagation()
        setSelected(Initial.selected())
        setMulti({})
        //only on left button = 0
        if (event.button) return
        if (dragged.index >= 0) return //should except
        const point = svgCoord(ref.current, event)
        const cleanup = function () {
            setDragged(initialDragged())
            event.target.releasePointerCapture(event.pointerId)
        }
        const frame = Initial.control()
        frame.setts.width = "1"
        frame.setts.height = "1"
        frame.setts.posX = `${point.posX}`
        frame.setts.posY = `${point.posY}`
        setDragged({ type, cleanup, frame, point })
        event.target.setPointerCapture(event.pointerId)
    }
    function screenPointerMove(event) {
        event.stopPropagation()
        if (dragged.type) {
            screenMove(event, false)
        }
    }
    function screenPointerUp(event) {
        event.stopPropagation()
        if (dragged.type) {
            screenMove(event, true)
            dragged.cleanup()
        }
    }
    //apple trackpads gestures generate capture losses
    //that prevented dropping because up event never came
    //when that happen, moves are received with index!=dragged.index
    function screenLostPointerCapture(event) {
        event.stopPropagation()
        if (dragged.type) {
            screenMove(event, true)
            dragged.cleanup()
        }
    }
    //onKeyPress wont receive arrows
    function screenKeyDown(event) {
        event.stopPropagation()
        if (event.key === "Escape") setMulti({})
        else Object.values(multi).forEach(c => applyKeyDown(event, c))
    }
    function screenEvents(type) {
        return {
            onLostPointerCapture: (e) => screenLostPointerCapture(e, type),
            onPointerDown: (e) => screenPointerDown(e, type),
            onPointerMove: (e) => screenPointerMove(e, type),
            onPointerUp: (e) => screenPointerUp(e, type),
            onKeyDown: (e) => screenKeyDown(e, type),
        }
    }
    function controlRender(control, index) {
        const csetts = control.setts
        //always draw them inside
        const mpos = { posX: gx - csetts.width, posY: gy - csetts.height }
        mpos.posX = mpos.posX < 0 ? 0 : mpos.posX
        mpos.posY = mpos.posY < 0 ? 0 : mpos.posY
        csetts.posX = csetts.posX > mpos.posX ? mpos.posX : csetts.posX
        csetts.posY = csetts.posY > mpos.posY ? mpos.posY : csetts.posY
        const x = csetts.posX * sx
        const y = csetts.posY * sy
        const w = csetts.width * sx
        const h = csetts.height * sy
        function controlMove(event, final) {
            const type = dragged.type
            if (type == "move") {
                const rect = dragged.rect
                const offset = dragged.offset
                const point = svgCoord(ref.current, event, rect, offset)
                point.posX = `${point.posX}`
                point.posY = `${point.posY}`
                const frame = dragged.frame
                //strings required to pass fix validation above
                frame.setts = { ...frame.setts, ...point }
                setDragged({ ...dragged, frame })
                if (final) {
                    const control = dragged.control
                    //prevent unexpected updates
                    if (csetts.posX !== point.posX) setCSetts(control, 'posX', point.posX)
                    if (csetts.posY !== point.posY) setCSetts(control, 'posY', point.posY)
                }
            } else {
                const point = svgCoord(ref.current, event)
                const rect = dragged.rect
                const origin = dragged.point
                const box = { ...dragged.rect }
                const deltaX = point.posX - origin.posX
                const deltaY = point.posY - origin.posY
                switch (type) {
                    case "edgeTop":
                        box.posY += deltaY
                        box.posY = fixMinMax(box.posY, 0, rect.posY2 - 1)
                        box.height += rect.posY - box.posY
                        break
                    case "edgeLeft":
                        box.posX += deltaX
                        box.posX = fixMinMax(box.posX, 0, rect.posX2 - 1)
                        box.width += rect.posX - box.posX
                        break
                    case "edgeBottom":
                        box.height += deltaY
                        box.height = fixMinMax(box.height, 1, gy - rect.posY)
                        break
                    case "edgeRight":
                        box.width += deltaX
                        box.width = fixMinMax(box.width, 1, gx - rect.posX)
                        break
                    case "edgeTopLeft":
                        box.posY += deltaY
                        box.posY = fixMinMax(box.posY, 0, rect.posY2 - 1)
                        box.height += rect.posY - box.posY
                        box.posX += deltaX
                        box.posX = fixMinMax(box.posX, 0, rect.posX2 - 1)
                        box.width += rect.posX - box.posX
                        break
                    case "edgeTopRight":
                        box.posY += deltaY
                        box.posY = fixMinMax(box.posY, 0, rect.posY2 - 1)
                        box.height += rect.posY - box.posY
                        box.width += deltaX
                        box.width = fixMinMax(box.width, 1, gx - rect.posX)
                        break
                    case "edgeBottomLeft":
                        box.height += deltaY
                        box.height = fixMinMax(box.height, 1, gy - rect.posY)
                        box.posX += deltaX
                        box.posX = fixMinMax(box.posX, 0, rect.posX2 - 1)
                        box.width += rect.posX - box.posX
                        break
                    case "edgeBottomRight":
                        box.height += deltaY
                        box.height = fixMinMax(box.height, 1, gy - rect.posY)
                        box.width += deltaX
                        box.width = fixMinMax(box.width, 1, gx - rect.posX)
                        break
                }
                box.posX = `${box.posX}`
                box.posY = `${box.posY}`
                box.width = `${box.width}`
                box.height = `${box.height}`
                const frame = dragged.frame
                //strings required to pass fix validation above
                frame.setts = { ...frame.setts, ...box }
                setDragged({ ...dragged, frame })
                if (final) {
                    const control = dragged.control
                    //prevent unexpected updates
                    if (csetts.posX !== box.posX) setCSetts(control, 'posX', box.posX)
                    if (csetts.posY !== box.posY) setCSetts(control, 'posY', box.posY)
                    if (csetts.width !== box.width) setCSetts(control, 'width', box.width)
                    if (csetts.height !== box.height) setCSetts(control, 'height', box.height)
                }
            }
        }
        function controlPointerDown(event, type) {
            event.stopPropagation()
            setMulti({})
            //only on left button = 0
            if (event.button) return
            if (dragged.index >= 0) return //should except
            const setts = control.setts
            const posX = Number(setts.posX)
            const posY = Number(setts.posY)
            const width = Number(setts.width)
            const height = Number(setts.height)
            const posX2 = posX + width
            const posY2 = posY + height
            const rect = { posX, posY, width, height, posX2, posY2 }
            const point = svgCoord(ref.current, event)
            const offset = { x: point.posX - posX, y: point.posY - posY }
            const cleanup = function () {
                setDragged(initialDragged())
                event.target.releasePointerCapture(event.pointerId)
            }
            const frame = JSON.parse(JSON.stringify(control))
            setDragged({ type, index, control, cleanup, frame, point, offset, rect })
            event.target.setPointerCapture(event.pointerId)

            //firefox click never fires
            //last change in control settings is applied
            //to newly selected control if selected right away
            //select on timeout to sync Checks.props blur
            //do not select anywhere else
            setTimeout(() => setSelected({ index, control }), 0)
        }
        function controlPointerMove(event) {
            event.stopPropagation()
            if (dragged.type) {
                controlMove(event, false)
            }
        }
        function controlPointerUp(event) {
            event.stopPropagation()
            if (dragged.type) {
                controlMove(event, true)
                dragged.cleanup()
            }
        }
        //apple trackpads gestures generate capture losses
        //that prevented dropping because up event never came
        //when that happen, moves are received with index!=dragged.index
        function controlLostPointerCapture(event) {
            event.stopPropagation()
            if (dragged.type) {
                controlMove(event, true)
                dragged.cleanup()
            }
        }
        //onKeyPress wont receive arrows
        function controlKeyDown(event) {
            event.stopPropagation()
            applyKeyDown(event, control)
        }
        function controlEvents(type, withClass) {
            const events = {
                onLostPointerCapture: (e) => controlLostPointerCapture(e, type),
                onPointerDown: (e) => controlPointerDown(e, type),
                onPointerMove: (e) => controlPointerMove(e, type),
                onPointerUp: (e) => controlPointerUp(e, type),
                onKeyDown: (e) => controlKeyDown(e, type),
            }
            if (withClass) events.className = type
            return events
        }
        //white fill with 0 opacity to force css hover pointer
        const size = { width: w, height: h }
        const isSelected = selected.control === control
        const tickBorder = isSelected || multi[control.id]
        const strokeWidth = tickBorder ? "6" : "2"
        const controller = Controls.getController(control.type)
        const value = Input.getter(csetts, null)
        const controlInstance = controller.Renderer({ control, size, value })
        const transpFrame = dragged.index === index || index < 0
        const fillOpacity = transpFrame ? "0.5" : "0"
        const borderOpacity = isSelected ? 0.1 : 0.2 //resize borders accumulate
        const { msx, msy } = { msx: Math.max(2, sx / 2), msy: Math.max(2, sy / 2) } //min=2 for grids > 1X00
        const controlEdges = isSelected ? <>
            <rect x={0} y={0} width={w} height={msy} fill={borderColor} fillOpacity={borderOpacity} {...controlEvents("edgeTop", true)} />
            <rect x={0} y={h - msy} width={w} height={msy} fill={borderColor} fillOpacity={borderOpacity} {...controlEvents("edgeBottom", true)} />
            <rect x={0} y={0} width={msx} height={h} fill={borderColor} fillOpacity={borderOpacity} {...controlEvents("edgeLeft", true)} />
            <rect x={w - msx} y={0} width={msx} height={h} fill={borderColor} fillOpacity={borderOpacity} {...controlEvents("edgeRight", true)} />
            <rect x={w - msx} y={0} width={msx} height={msy} fill={borderColor} fillOpacity={borderOpacity} {...controlEvents("edgeTopRight", true)} />
            <rect x={w - msx} y={h - msy} width={msx} height={msy} fill={borderColor} fillOpacity={borderOpacity} {...controlEvents("edgeBottomRight", true)} />
            <rect x={0} y={0} width={msx} height={msy} fill={borderColor} fillOpacity={borderOpacity} {...controlEvents("edgeTopLeft", true)} />
            <rect x={0} y={h - msy} width={msx} height={msy} fill={borderColor} fillOpacity={borderOpacity} {...controlEvents("edgeBottomLeft", true)} />
        </> : null
        const controlBorder = !preview ? (
            <>
                <rect width="100%" height="100%" fill="white" fillOpacity={fillOpacity}
                    stroke={borderColor} strokeWidth={strokeWidth} strokeOpacity={borderOpacity} />
                {controlEdges}
            </>
        ) : null
        const moveEvents = index >= 0 ? controlEvents("move") : {}
        //setting tabIndex adds a selection border that extends to the inner contents
        //tabIndex required to receive keyboard events
        const key = control.id
        return (
            <svg key={key} x={x} y={y} tabIndex={index}
                width={w} height={h} className="draggable"
                {...moveEvents}>
                {controlInstance}
                {controlBorder}
            </svg>
        )
    }
    const controlList = controls.map(controlRender)
    const gridRect = !preview ? (<rect width={W} height={H} fill="url(#grid)" fillOpacity="0.1" />) : null
    const dragFrame = dragged.type ? controlRender(dragged.frame, -1) : null
    return (<svg ref={ref} width="100%" height="100%" onPointerDown={(e) => backPointerDown(e)}>
        <rect width="100%" height="100%" fill="none" stroke="gray" strokeWidth="1" strokeOpacity="0.4" />
        <svg width="100%" height="100%" viewBox={vb} preserveAspectRatio='none' {...screenEvents("multi")} tabIndex={0}>
            <defs>
                <pattern id="grid" width={sx} height={sy} patternUnits="userSpaceOnUse">
                    <path d={`M ${sx} 0 L 0 0 0 ${sy}`} fill="none"
                        stroke={gridColor} strokeWidth="1" />
                </pattern>
            </defs>
            <rect width={W} height={H} fill={setts.backColor} stroke="gray" strokeWidth="1" strokeOpacity="0.4" />
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
    const scaleOptions = Initial.scales.map(v => <option key={v} value={v}>{v}</option>)
    const alignOptions = Initial.aligns.map(v => <option key={v} value={v}>{v}</option>)
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
                            {scaleOptions}
                        </Form.Select>
                    </FormEntry>
                    <FormEntry label={Initial.labels.align}>
                        <Form.Select {...settsProps("align")}>
                            {alignOptions}
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
                    <FormEntry label={Initial.labels.backColor}>
                        <InputGroup>
                            <Form.Control type="color" {...settsProps("backColor")} />
                            <Form.Control type="text" {...settsProps("backColor")} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label={Initial.labels.hoverColor}>
                        <InputGroup>
                            <Form.Control type="color" {...settsProps("hoverColor")} />
                            <Form.Control type="text" {...settsProps("hoverColor")} />
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
        args.check = Initial.cschecks[prop]
        args.defval = Initial.csetts()[prop]
        return Check.props(args)
    }
    const inputProps = setts.input || setts.defEnabled ? <>
        <FormEntry label={Initial.clabels.inputScale}>
            <InputGroup>
                <Form.Control type="number" {...settsProps("inputFactor")} />
                <Form.Control type="number" {...settsProps("inputOffset")} />
            </InputGroup>
        </FormEntry>
    </> : null

    const promptProp = setts.click === "Value Prompt" ? <FormEntry label={Initial.clabels.prompt}>
        <Form.Control type="text" {...settsProps("prompt")} />
    </FormEntry> : <FormEntry label={Initial.clabels.value}>
        <Form.Control type="number" {...settsProps("value")} />
    </FormEntry>

    const clickOptions = Initial.clicks.map(v => <option key={v} value={v}>{v}</option>)

    const outputProps = setts.output ? <>
        <FormEntry label={Initial.clabels.outputScale}>
            <InputGroup>
                <Form.Control type="number" {...settsProps("outputFactor")} />
                <Form.Control type="number" {...settsProps("outputOffset")} />
            </InputGroup>
        </FormEntry>
        <FormEntry label={Initial.clabels.click}>
            <Form.Select {...settsProps("click")} >
                {clickOptions}
            </Form.Select>
        </FormEntry>
        {promptProp}
    </> : <FormEntry label={Initial.clabels.link}>
        <InputGroup>
            <InputGroup.Checkbox checked={setts.linkBlank}
                onChange={e => setCSetts(control, "linkBlank", e.target.checked)}
                title={Initial.clabels.linkBlank} />
            <Form.Control type="text" {...settsProps("linkURL")} />
        </InputGroup>
    </FormEntry>

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
                            <InputGroup>
                                <Form.Control type="number" {...settsProps("posX")} min="0" step="1" />
                                <Form.Control type="number" {...settsProps("posY")} min="0" step="1" />
                            </InputGroup>
                        </FormEntry>
                        <FormEntry label={Initial.clabels.dimensions}>
                            <InputGroup>
                                <Form.Control type="number" {...settsProps("width")} min="1" step="1" />
                                <Form.Control type="number" {...settsProps("height")} min="1" step="1" />
                            </InputGroup>
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
                        <FormEntry label={Initial.clabels.defValue}>
                            <InputGroup>
                                <InputGroup.Checkbox checked={setts.defEnabled}
                                    onChange={e => setCSetts(control, "defEnabled", e.target.checked)}
                                    title={Initial.clabels.defEnabled} />
                                <Form.Control type="number" {...settsProps("defValue")} />
                            </InputGroup>
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
                const type = control.type
                if (input.trim().length > 0) {
                    const config = inputs[input] || { period: Number.MAX_SAFE_INTEGER, length: 0, trend: false }
                    if (type == "Trend") {
                        config.trend = true
                        config.length = Math.max(config.length, control.data.sampleLength)
                        config.period = Math.min(config.period, control.data.samplePeriod)
                    }
                    inputs[input] = config
                }
                return inputs
            }, {})
            const config = { setts, controls, inputs }
            props.setter(config)
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
                const cloned = JSON.parse(JSON.stringify(control))
                cloned.id = Initial.id()
                next.push(cloned)
                setControls(next)
                break
            }
            case "xdec": {
                setCSetts(control, "posX", rangeValue(control.setts.posX, -1, 0, setts.gridX, control.setts.width))
                break
            }
            case "xdec10": {
                setCSetts(control, "posX", rangeValue(control.setts.posX, -10, 0, setts.gridX, control.setts.width))
                break
            }
            case "xinc": {
                setCSetts(control, "posX", rangeValue(control.setts.posX, +1, 0, setts.gridX, control.setts.width))
                break
            }
            case "xinc10": {
                setCSetts(control, "posX", rangeValue(control.setts.posX, +10, 0, setts.gridX, control.setts.width))
                break
            }
            case "ydec": {
                setCSetts(control, "posY", rangeValue(control.setts.posY, -1, 0, setts.gridY, control.setts.height))
                break
            }
            case "ydec10": {
                setCSetts(control, "posY", rangeValue(control.setts.posY, -10, 0, setts.gridY, control.setts.height))
                break
            }
            case "yinc": {
                setCSetts(control, "posY", rangeValue(control.setts.posY, +1, 0, setts.gridY, control.setts.height))
                break
            }
            case "yinc10": {
                setCSetts(control, "posY", rangeValue(control.setts.posY, +10, 0, setts.gridY, control.setts.height))
                break
            }
            case "wdec": {
                setCSetts(control, "width", rangeValue(control.setts.width, -1, 1, setts.gridX, control.setts.posX))
                break
            }
            case "wdec10": {
                setCSetts(control, "width", rangeValue(control.setts.width, -10, 1, setts.gridX, control.setts.posX))
                break
            }
            case "winc": {
                setCSetts(control, "width", rangeValue(control.setts.width, +1, 1, setts.gridX, control.setts.posX))
                break
            }
            case "winc10": {
                setCSetts(control, "width", rangeValue(control.setts.width, +10, 1, setts.gridX, control.setts.posX))
                break
            }
            case "hdec": {
                setCSetts(control, "height", rangeValue(control.setts.height, -1, 1, setts.gridY, control.setts.posY))
                break
            }
            case "hdec10": {
                setCSetts(control, "height", rangeValue(control.setts.height, -10, 1, setts.gridY, control.setts.posY))
                break
            }
            case "hinc": {
                setCSetts(control, "height", rangeValue(control.setts.height, +1, 1, setts.gridY, control.setts.posY))
                break
            }
            case "hinc10": {
                setCSetts(control, "height", rangeValue(control.setts.height, +10, 1, setts.gridY, control.setts.posY))
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
