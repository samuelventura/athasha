import React, { useState, useReducer, useEffect } from 'react'
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
import Controller from "../common/Controller"
import Points from '../common/Points'
import Check from '../common/Check'
import Color from "../common/Color"
import Type from "../common/Type"
import Clone from "../tools/Clone"
import Input from "../screen/Input"
import State from "./screen/State"
import Keys from "../common/Keys"
import Svg from "../common/Svg"

const $type = Type.Screen
const $schema = $type.schema()

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
function SvgWindow({ ctx, preview }) {
    const setts = ctx.state.setts
    const controls = ctx.state.controls
    const buffered = ctx.buffered
    const immediate = ctx.immediate
    const multi = ctx.state.multi.reduce((map, id) => {
        const index = ctx.state.indexes[id]
        map[id] = controls[index]
        return map
    }, {})
    const selected = ctx.state.selected
    //size reported here grows with svg content/viewBox
    //generated size change events are still valuable
    const resize = useResizeDetector()
    const [dragged, setDragged] = useState(() => initialDragged())
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
    //do not stop propagation unless used or the 
    //global key hooks like ctrl+s wont work
    function applyKeyDownAll(event, control) {
        if (event.key === "Escape") {
            event.stopPropagation()
            immediate.setMulti()
        } else if (ctx.state.multi.length > 0) {
            ctx.state.multi.forEach(id => applyKeyDown(event, buffered, id))
        } else if (control) {
            applyKeyDown(event, buffered, control.id)
        }
        if (buffered.count() > 0) {
            event.stopPropagation()
            buffered.apply()
        }
    }
    function applyKeyDown(event, mutator, id) {
        switch (event.code) {
            case "Delete": {
                mutator.actionControl(id, 'del')
                return
            }
            case "ArrowDown": {
                if (event.altKey) mutator.actionControl(id, event.shiftKey ? 'bottom' : 'down')
                else if (Keys.isCtrlKey(event)) mutator.actionControl(id, event.shiftKey ? 'hinc10' : 'hinc')
                else mutator.actionControl(id, event.shiftKey ? 'yinc10' : 'yinc')
                break
            }
            case "ArrowUp": {
                if (event.altKey) mutator.actionControl(id, event.shiftKey ? 'top' : "up")
                else if (Keys.isCtrlKey(event)) mutator.actionControl(id, event.shiftKey ? 'hdec10' : 'hdec')
                else mutator.actionControl(id, event.shiftKey ? 'ydec10' : 'ydec')
                break
            }
            case "ArrowLeft": {
                if (Keys.isCtrlKey(event)) mutator.actionControl(id, event.shiftKey ? 'wdec10' : 'wdec')
                else mutator.actionControl(id, event.shiftKey ? 'xdec10' : 'xdec')
                break
            }
            case "ArrowRight": {
                if (Keys.isCtrlKey(event)) mutator.actionControl(id, event.shiftKey ? 'winc10' : 'winc')
                else mutator.actionControl(id, event.shiftKey ? 'xinc10' : 'xinc')
                break
            }
        }
    }
    function multiRect(multi) {
        const next = { posX: gx, posY: gy, posX2: 0, posY2: 0 }
        Object.values(multi).forEach(control => {
            const rect = controlRect(control)
            if (next.posX > rect.posX) next.posX = rect.posX
            if (next.posY > rect.posY) next.posY = rect.posY
            if (next.posX2 < rect.posX2) next.posX2 = rect.posX2
            if (next.posY2 < rect.posY2) next.posY2 = rect.posY2
        })
        next.width = next.posX2 - next.posX
        next.height = next.posY2 - next.posY
        return next
    }
    function controlRect(control) {
        const setts = control.setts
        const next = {}
        next.posX = Number(setts.posX)
        next.posY = Number(setts.posY)
        next.width = Number(setts.width)
        next.height = Number(setts.height)
        next.posX2 = next.posX + next.width
        next.posY2 = next.posY + next.height
        return next
    }
    function pointToString(point) {
        const next = {}
        next.posX = `${point.posX}`
        next.posY = `${point.posY}`
        return next
    }
    function rectToString(rect) {
        const next = pointToString(rect)
        next.width = `${rect.width}`
        next.height = `${rect.height}`
        return next
    }
    function applyPoint(control, mutator, point) {
        const setts = control.setts
        const id = control.id
        //strings required to pass validation
        point = pointToString(point)
        if (setts.posX !== point.posX) mutator.setControlSetts(id, 'posX', point.posX)
        if (setts.posY !== point.posY) mutator.setControlSetts(id, 'posY', point.posY)
    }
    function applyRect(control, mutator, rect) {
        const setts = control.setts
        const id = control.id
        //strings required to pass validation
        rect = rectToString(rect)
        if (setts.posX !== rect.posX) mutator.setControlSetts(id, 'posX', rect.posX)
        if (setts.posY !== rect.posY) mutator.setControlSetts(id, 'posY', rect.posY)
        if (setts.width !== rect.width) mutator.setControlSetts(id, 'width', rect.width)
        if (setts.height !== rect.height) mutator.setControlSetts(id, 'height', rect.height)
    }
    //calculates the location of a dragged rect within the bounds of the viewport
    function rectLocation(el, e, r, o) {
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
        const point = rectLocation(ref.current, event)
        const box = {}
        box.posX = Math.min(point.posX, dragged.point.posX)
        box.posY = Math.min(point.posY, dragged.point.posY)
        box.width = Math.abs(point.posX - dragged.point.posX)
        box.height = Math.abs(point.posY - dragged.point.posY)
        box.posX2 = box.posX + box.width
        box.posY2 = box.posY + box.height
        const rect = rectToString(box)
        const frame = dragged.frame
        //strings required to pass fix validation above
        frame.setts = { ...frame.setts, ...rect }
        setDragged({ ...dragged, frame })
        if (final) {
            const next = []
            controls.forEach(c => {
                const r = controlRect(c)
                const inter = Math.max(box.posX, r.posX) < Math.min(box.posX2, r.posX2) &&
                    Math.max(box.posY, r.posY) < Math.min(box.posY2, r.posY2)
                if (inter) next.push(c.id)
            })
            immediate.setMulti(next)
        }
    }
    function clearSelection() {
        buffered.setSelected()
        buffered.setMulti()
        buffered.apply()
    }
    //ensure blur since depending on
    //preview flag and background color
    //the event will be caugh by a rect
    //the svg imposing the need to add tabIndex
    //to all the hieranchy hence better to search
    //the focusable ancestor and focus it
    //failure to blur will cause 'not null captured'
    function findFocusable(event) {
        let target = event.target
        while (target) {
            const flag = target.hasAttribute("tabindex")
            if (flag) {
                target.focus()
                break
            }
            else target = target.parentElement
        }
    }
    function backPointerDown(event) {
        findFocusable(event) //ensure blur
        event.stopPropagation()
        clearSelection()
    }
    function screenPointerDown(event, type) {
        findFocusable(event) //ensure blur
        event.stopPropagation()
        clearSelection()
        //only on left button = 0
        if (event.button) return
        if (dragged.index >= 0) return //should except
        const point = rectLocation(ref.current, event)
        const cleanup = function () {
            setDragged(initialDragged())
            event.target.releasePointerCapture(event.pointerId)
        }
        const frame = $type.control()
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
    //tabIndex required in screen svg for 
    //findFocusable to stop there
    function screenKeyDown(event) {
        applyKeyDownAll(event)
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
                const group = dragged.group
                const rect = group ? group.gbox : dragged.rect
                const offset = group ? group.goff : dragged.offset
                const point = rectLocation(ref.current, event, rect, offset)
                const frame = dragged.frame
                if (group) point.posX += group.gdel.x
                if (group) point.posY += group.gdel.y
                frame.setts = { ...frame.setts, ...point }
                setDragged({ ...dragged, frame })
                if (final) {
                    if (group) {
                        const deltaX = point.posX - dragged.rect.posX
                        const deltaY = point.posY - dragged.rect.posY
                        Object.values(group.multi).forEach(control => {
                            const rect = controlRect(control)
                            rect.posX += deltaX
                            rect.posY += deltaY
                            applyPoint(control, buffered, rect)
                        })
                        buffered.apply()
                    } else {
                        const control = dragged.control
                        applyPoint(control, buffered, point)
                        buffered.apply()
                    }
                }
            } else {
                const point = rectLocation(ref.current, event)
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
                const frame = dragged.frame
                frame.setts = { ...frame.setts, ...box }
                setDragged({ ...dragged, frame })
                if (final) {
                    const control = dragged.control
                    applyRect(control, buffered, box)
                    buffered.apply()
                }
            }
        }
        function controlPointerDown(event, type) {
            findFocusable(event) //ensure blur
            event.stopPropagation()
            //keep multi selection for multi d&d
            //clear multi only if non member control
            const isMulti = type == "move" && multi[control.id]
            if (!isMulti) immediate.setMulti()
            //only on left button = 0
            if (event.button) return
            if (dragged.index >= 0) return //should except
            const rect = controlRect(control)
            const point = rectLocation(ref.current, event)
            const offset = { x: point.posX - rect.posX, y: point.posY - rect.posY }
            const gbox = multiRect(multi)
            const goff = { x: point.posX - gbox.posX, y: point.posY - gbox.posY }
            const gdel = { x: rect.posX - gbox.posX, y: rect.posY - gbox.posY }
            const group = isMulti ? { gbox, goff, gdel, multi } : null
            const cleanup = function () {
                setDragged(initialDragged())
                event.target.releasePointerCapture(event.pointerId)
            }
            const frame = Clone.deep(control)
            setDragged({ type, index, control, cleanup, frame, point, offset, rect, group })
            event.target.setPointerCapture(event.pointerId)

            //firefox click never fires
            //last change in control settings is applied
            //to newly selected control if selected right away
            //select on timeout to sync Checks.props blur
            //do not select anywhere else
            //setTimeout(() => immediate.setSelected(control.id), 0)
            //timeout not needed after adding tabIndex to controls
            immediate.setSelected(control.id)
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
            applyKeyDownAll(event, control)
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
        const isSelected = selected === control.id
        const tickBorder = isSelected || multi[control.id]
        const strokeWidth = tickBorder ? "6" : "2"
        const controller = Controller.get(control.type)
        const value = Input.getter(csetts, null)
        const controlInstance = controller.Renderer({ control, size, value })
        const transpFrame = dragged.index === index || index < 0
        const fillOpacity = transpFrame ? "0.5" : "0"
        const borderOpacity = isSelected ? 0.1 : 0.2 //resize borders accumulate
        //min=2 for grids > 1X00, 3 = 6/2 from tickBorder above, half lies outside
        const { msx, msy } = { msx: Math.max(3, sx), msy: Math.max(3, sy) }
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
        //tabIndex to receive keyboard events and avoid delaying selection
        const key = control.id
        return (
            <svg key={key} x={x} y={y} tabIndex={-1}
                width={w} height={h} className="draggable"
                {...moveEvents}>
                {controlInstance}
                {controlBorder}
            </svg>
        )
    }
    const controlList = controls.map(controlRender)
    const [guideWidth, guideOpacity, guideLine] = [1, 0.4, "2 2"] //low opacity hard to see on dark backgrounds
    const gridRect = !preview ? (<rect width={W} height={H} fill="url(#grid)" fillOpacity="0.1" />) : null
    const renderDrag = () => {
        const frame = dragged.frame
        const type = dragged.type
        if (type === "multi") return controlRender(frame, -1)
        const edge = type.includes("edge")
        const dragControl = controlRender(frame, -1)
        const rect = controlRect(frame)
        const [x1, y1, x2, y2] = [rect.posX * sx, rect.posY * sy, rect.posX2 * sx, rect.posY2 * sy]
        const left = <line x1={x1} x2={x1} y1={0} y2={H} stroke={borderColor} strokeOpacity={guideOpacity} strokeWidth={guideWidth} strokeDasharray={guideLine} />
        const right = <line x1={x2} x2={x2} y1={0} y2={H} stroke={borderColor} strokeOpacity={guideOpacity} strokeWidth={guideWidth} strokeDasharray={guideLine} />
        const top = <line x1={0} x2={W} y1={y1} y2={y1} stroke={borderColor} strokeOpacity={guideOpacity} strokeWidth={guideWidth} strokeDasharray={guideLine} />
        const bottom = <line x1={0} x2={W} y1={y2} y2={y2} stroke={borderColor} strokeOpacity={guideOpacity} strokeWidth={guideWidth} strokeDasharray={guideLine} />
        return <>
            {dragControl}
            {!edge || type.includes("Left") ? left : null}
            {!edge || type.includes("Right") ? right : null}
            {!edge || type.includes("Top") ? top : null}
            {!edge || type.includes("Bottom") ? bottom : null}
        </>
    }
    const bgValid = !!setts.background.viewBox
    const bgImage = bgValid ? Svg.render(setts.background) : null
    const dragFrame = dragged.type ? renderDrag() : null
    return (<svg ref={ref} width="100%" height="100%" onPointerDown={(e) => backPointerDown(e)} tabIndex={-1}>
        <rect width="100%" height="100%" fill="none" stroke="gray" strokeWidth="1" strokeOpacity="0.4" />
        <svg width="100%" height="100%" viewBox={vb} preserveAspectRatio='none' {...screenEvents("multi")} tabIndex={-1}>
            <defs>
                <pattern id="grid" width={sx} height={sy} patternUnits="userSpaceOnUse">
                    <path d={`M ${sx} 0 L 0 0 0 ${sy}`} fill="none"
                        stroke={gridColor} strokeWidth="1" />
                </pattern>
            </defs>
            <rect width={W} height={H} fill={setts.backColor} stroke="gray" strokeWidth="1" strokeOpacity="0.4" />
            <svg width={W} height={H}>{bgImage}</svg>
            {gridRect}
            {controlList}
            {dragFrame}
        </svg>
    </svg >)
}

function LeftPanel({ ctx }) {
    const state = ctx.state
    const setts = state.setts
    const immediate = ctx.immediate
    function addControl(controller) {
        const control = $type.control()
        const $control = controller.$control
        control.setts.width = Math.max(1, Math.trunc(setts.gridX / 10)).toString()
        control.setts.height = Math.max(1, Math.trunc(setts.gridY / 10)).toString()
        control.type = $control.type
        if ($control.data) {
            control.data = $control.data()
        }
        immediate.addControl(control)
    }
    const controlList = Controller.list().map((controller, index) => {
        const $control = controller.$control
        return (<ListGroup.Item action key={index}
            title={`Add new ${$control.type}`}
            onClick={() => addControl(controller)}>
            {$control.type}</ListGroup.Item>)
    })
    return ctx.left ? (
        <Card>
            <Card.Header>Controls
                <Button variant='link' size="sm" onClick={() => ctx.setLeft(false)}
                    title="Hide" className="p-0 float-end">
                    <FontAwesomeIcon icon={faAnglesLeft} />
                </Button>
            </Card.Header>
            <ListGroup variant="flush">
                {controlList}
            </ListGroup>
        </Card>) : (
        <Button variant='link' size="sm" onClick={() => ctx.setLeft(true)} title="Controls">
            <FontAwesomeIcon icon={faAnglesRight} />
        </Button>
    )
}

function ScreenEditor({ ctx, previewControl }) {
    const globals = ctx.globals
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    const immediate = ctx.immediate
    function settsProps(prop) {
        function setter(name) {
            return function (value) {
                immediate.setSetts(name, value)
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $schema.setts[prop], prop)
        args.getter = () => ctx.state.setts[prop]
        args.setter = setter(prop)
        return Check.props(args)
    }
    const dataBg = ctx.state.setts.background
    function setBgProp(name, value) {
        const bg = Clone.deep(dataBg)
        bg[name] = value
        immediate.setSetts("background", bg)
    }
    function bgProps(prop) {
        function setter(name) {
            return function (value) {
                setBgProp(name, value)
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $schema.setts.background[prop], prop)
        args.getter = () => ctx.state.setts.background[prop]
        args.setter = setter(prop)
        return Check.props(args)
    }
    const scaleOptions = $type.scales.map(v => <option key={v} value={v}>{v}</option>)
    const alignOptions = $type.aligns.map(v => <option key={v} value={v}>{v}</option>)
    const validBg = !!dataBg.viewBox
    const onUpload = () => Svg.onUpload(({ svg, fn, vb }) => {
        console.log(fn, vb)
        const bg = Clone.deep(dataBg)
        bg.content = svg
        bg.filename = fn
        bg.viewBox = vb
        immediate.setSetts("background", bg)
    })
    const onDownload = () => Svg.onDownload(dataBg)
    const onClear = () => {
        const bg = Clone.deep(dataBg)
        bg.content = ""
        bg.filename = ""
        bg.viewBox = ""
        immediate.setSetts("background", bg)
    }
    return (
        <Card>
            <Card.Header>
                <Button variant='link' size="sm" onClick={() => ctx.setRight(false)} title="Hide">
                    <FontAwesomeIcon icon={faAnglesRight} />
                </Button>Screen Settings
                {previewControl}
            </Card.Header>
            <ListGroup variant="flush">
                <ListGroup.Item>
                    <FormEntry label={$schema.setts.password.label}>
                        <Form.Control type="password" {...settsProps("password")} />
                    </FormEntry>
                    <FormEntry label={$schema.setts.period.label}>
                        <Form.Control type="number" {...settsProps("period")} min="1" step="1" />
                    </FormEntry>
                    <FormEntry label={$schema.setts.scale.label}>
                        <Form.Select {...settsProps("scale")}>
                            {scaleOptions}
                        </Form.Select>
                    </FormEntry>
                    <FormEntry label={$schema.setts.align.label}>
                        <Form.Select {...settsProps("align")}>
                            {alignOptions}
                        </Form.Select>
                    </FormEntry>
                    <FormEntry label={$schema.setts.width.label}>
                        <Form.Control type="number" {...settsProps("width")} min="1" step="1" />
                    </FormEntry>
                    <FormEntry label={$schema.setts.height.label}>
                        <Form.Control type="number" {...settsProps("height")} min="1" step="1" />
                    </FormEntry>
                    <FormEntry label={$schema.setts.gridX.label}>
                        <Form.Control type="number" {...settsProps("gridX")} min="1" step="1" />
                    </FormEntry>
                    <FormEntry label={$schema.setts.gridY.label}>
                        <Form.Control type="number" {...settsProps("gridY")} min="1" step="1" />
                    </FormEntry>
                    <FormEntry label={$schema.setts.backColor.label}>
                        <InputGroup>
                            <Form.Control type="color" {...settsProps("backColor")} />
                            <Form.Control type="text" {...settsProps("backColor")} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label={$schema.setts.hoverColor.label}>
                        <InputGroup>
                            <Form.Control type="color" {...settsProps("hoverColor")} />
                            <Form.Control type="text" {...settsProps("hoverColor")} />
                        </InputGroup>
                    </FormEntry>
                    <FormEntry label="Background">
                        <Button variant="link" onClick={onUpload}
                            title="Select SVG file to upload">Upload...</Button>
                        <Button variant="link" onClick={onDownload} disabled={!validBg}
                            title={dataBg.filename}>Download</Button>
                        <Button variant="link" onClick={onClear} disabled={!validBg}
                            title="Remove background">Clear</Button>
                    </FormEntry>
                    <FormEntry label={$schema.setts.background.scale.label}>
                        <Form.Select {...bgProps("scale")}>
                            {scaleOptions}
                        </Form.Select>
                    </FormEntry>
                    <FormEntry label={$schema.setts.background.align.label}>
                        <Form.Select {...bgProps("align")}>
                            {alignOptions}
                        </Form.Select>
                    </FormEntry>
                </ListGroup.Item>
            </ListGroup>
        </Card>)
}

function ControlEditor({ ctx, previewControl }) {
    const state = ctx.state
    const selected = state.selected
    const index = state.indexes[selected]
    const control = state.controls[index]
    const setts = control.setts
    const globals = ctx.globals
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    const controller = Controller.get(control.type)
    const $setts = $schema.controls.setts
    const immediate = ctx.immediate
    const setProp = (name, value) => immediate.setControlData(selected, name, value)
    const getControl = () => {
        const state = ctx.state
        const selected = state.selected
        const index = state.indexes[selected]
        return state.controls[index]
    }
    const editor = controller.Editor ? controller.Editor({ getControl, setProp, globals }) : null
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
    function settsProps(prop, checkbox) {
        function setter(name) {
            return function (value) {
                immediate.setControlSetts(selected, name, value)
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $setts[prop], prop)
        args.getter = () => getControl().setts[prop]
        args.setter = setter(prop)
        args.checkbox = checkbox
        return Check.props(args)
    }
    const inputProps = setts.input || setts.defEnabled ? <>
        <FormEntry label="Input Scale">
            <InputGroup>
                <Form.Control type="number" {...settsProps("inputFactor")} />
                <Form.Control type="number" {...settsProps("inputOffset")} />
            </InputGroup>
        </FormEntry>
    </> : null

    const promptProp = setts.click === "Value Prompt" ? <FormEntry label={$setts.prompt.label}>
        <Form.Control type="text" {...settsProps("prompt")} />
    </FormEntry> : <FormEntry label={$setts.value.label}>
        <Form.Control type="number" {...settsProps("value")} />
    </FormEntry>

    const clickOptions = $type.clicks.map(v => <option key={v} value={v}>{v}</option>)

    const outputProps = setts.output ? <>
        <FormEntry label="Output Scale">
            <InputGroup>
                <Form.Control type="number" {...settsProps("outputFactor")} />
                <Form.Control type="number" {...settsProps("outputOffset")} />
            </InputGroup>
        </FormEntry>
        <FormEntry label={$setts.click.label}>
            <Form.Select {...settsProps("click")} >
                {clickOptions}
            </Form.Select>
        </FormEntry>
        {promptProp}
    </> : <FormEntry label="Link">
        <InputGroup>
            <InputGroup.Checkbox {...settsProps("linkBlank", true)} />
            <Form.Control type="text" {...settsProps("linkURL")} />
        </InputGroup>
    </FormEntry>
    const actionControl = (action) => immediate.actionControl(selected, action)
    return (
        <>
            <Card>
                <Card.Header>
                    <Button variant='link' size="sm" onClick={() => ctx.setRight(false)} title="Hide">
                        <FontAwesomeIcon icon={faAnglesRight} />
                    </Button>
                    Control Settings
                    {previewControl}
                </Card.Header>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <Button variant='outline-danger' size="sm" className="float-end"
                            onClick={() => actionControl('del')} title="Remove Selected Control">
                            <FontAwesomeIcon icon={faTimes} />
                        </Button>
                        <Button variant='outline-secondary' size="sm"
                            onClick={() => actionControl('bottom')} title="Selected Control To Bottom">
                            <FontAwesomeIcon icon={faAnglesDown} />
                        </Button>
                        <Button variant='outline-secondary' size="sm"
                            onClick={() => actionControl('down')} title="Selected Control Down">
                            <FontAwesomeIcon icon={faAngleDown} />
                        </Button>
                        <Button variant='outline-secondary' size="sm"
                            onClick={() => actionControl('up')} title="Selected Control Up">
                            <FontAwesomeIcon icon={faAngleUp} />
                        </Button>
                        <Button variant='outline-secondary' size="sm"
                            onClick={() => actionControl('top')} title="Selected Control To Top">
                            <FontAwesomeIcon icon={faAnglesUp} />
                        </Button>
                        &nbsp;&nbsp;
                        <Button variant='outline-secondary' size="sm"
                            onClick={() => actionControl('clone')} title="Clone Selected Control">
                            <FontAwesomeIcon icon={faClone} />
                        </Button>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <FormEntry label="Position">
                            <InputGroup>
                                <Form.Control type="number" {...settsProps("posX")} min="0" step="1" />
                                <Form.Control type="number" {...settsProps("posY")} min="0" step="1" />
                            </InputGroup>
                        </FormEntry>
                        <FormEntry label="Dimensions">
                            <InputGroup>
                                <Form.Control type="number" {...settsProps("width")} min="1" step="1" />
                                <Form.Control type="number" {...settsProps("height")} min="1" step="1" />
                            </InputGroup>
                        </FormEntry>
                        <FormEntry label={$setts.title.label}>
                            <Form.Control type="text" {...settsProps("title")} />
                        </FormEntry>
                        <FormEntry label={$setts.input.label}>
                            <Form.Select {...settsProps("input")} >
                                <option value=""></option>
                                {Points.options(globals.inputs)}
                            </Form.Select>
                        </FormEntry>
                        <FormEntry label={$setts.defValue.label}>
                            <InputGroup>
                                <InputGroup.Checkbox {...settsProps("defEnabled", true)} />
                                <Form.Control type="number" {...settsProps("defValue")} />
                            </InputGroup>
                        </FormEntry>
                        {inputProps}
                        <FormEntry label={$setts.output.label}>
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

function RightPanel({ ctx, previewControl }) {
    const screenEditor = <ScreenEditor
        ctx={ctx}
        previewControl={previewControl}
    />
    const controlEditor = <ControlEditor
        ctx={ctx}
        previewControl={previewControl}
    />
    const selected = ctx.state.selected
    return ctx.right ? (selected ? controlEditor : screenEditor) : (
        <Button variant='link' size="sm" onClick={() => ctx.setRight(true)} title="Settings">
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

//context needs to be same object between calls
//otherwise getter passed to Check.props captures 
//it and reports stalled property values
const ctx = {}

function Editor(props) {
    const [state, dispatch] = useReducer(State.reducer, State.initial(props.config))
    const [preview, setPreview] = useState(false)
    const [right, setRight] = useState(true)
    const [left, setLeft] = useState(true)
    ctx.state = state
    ctx.dispatch = dispatch
    ctx.preview = preview
    ctx.setPreview = setPreview
    ctx.right = right
    ctx.setRight = setRight
    ctx.left = left
    ctx.setLeft = setLeft
    ctx.globals = props.globals
    ctx.buffered = State.mutator(ctx, true)
    ctx.immediate = State.mutator(ctx)
    useEffect(() => {
        const config = props.config
        const setts = config.setts
        const controls = config.controls
        ctx.immediate.init(setts, controls)
    }, [props.hash])
    useEffect(() => {
        const inputs = state.controls.reduce((inputs, control) => {
            const input = control.setts.input
            const type = control.type
            if (input.trim().length > 0) {
                const init = { period: Number.MAX_SAFE_INTEGER, length: 0, trend: false }
                const config = inputs[input] || init
                if (type == "Trend") {
                    config.trend = true
                    config.length = Math.max(config.length, control.data.sampleLength)
                    config.period = Math.min(config.period, control.data.samplePeriod)
                }
                inputs[input] = config
            }
            return inputs
        }, {})
        const setts = state.setts
        const controls = state.controls
        const config = { setts, controls, inputs }
        props.setter(config)
    }, [state.version])
    const rightStyle = right ? { flex: "0 0 32em", overflowY: "auto" } : {}
    const leftStyle = left ? { flex: "0 0 12em", overflowY: "auto" } : {}
    const previewControl = <PreviewControl
        preview={preview}
        setPreview={setPreview}
    />
    return (
        <Row className="h-100">
            <Col sm="auto" style={leftStyle} className="mh-100">
                <LeftPanel ctx={ctx} />
            </Col>
            <Col className="gx-0 bg-light">
                <SvgWindow ctx={ctx} preview={preview} />
            </Col>
            <Col sm="auto" style={rightStyle} className="mh-100">
                <RightPanel ctx={ctx} previewControl={previewControl} />
            </Col>
        </Row>
    )
}

export default Editor
