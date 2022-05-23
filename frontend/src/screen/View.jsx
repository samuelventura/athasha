import React, { useState, useRef, useEffect } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Controls from '../editors/Controls'
import { useApp } from '../App'

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
    }
    x = fixNum(x)
    y = fixNum(y)
    w = fixNum(w)
    h = fixNum(h)
    const vb = `${x} ${y} ${w} ${h}`
    const vp = { x, y, w, h }
    return { gx, gy, sx, sy, W, H, vb, vp }
}

function PromptValue() {
    const app = useApp()
    const prompt = app.state.prompt
    const focus = useRef(null)
    const [value, setValue] = useState("")
    function isActive() { return prompt.output }
    function isValid() { return typeof value === 'string' && value.trim().length > 0 && isFinite(value) }
    function onKeyPress(e) {
        if (e.key === 'Enter') {
            onAccept()
        }
    }
    function onCancel() {
        app.dispatch({ name: "prompt", args: {} })
    }
    function onAccept() {
        if (isValid()) {
            const name = prompt.output
            const fixed = Number(value) //support 0xFF
            app.send({ name: "write", args: { name, value: fixed } })
            app.dispatch({ name: "prompt", args: {} })
        }
    }
    useEffect(() => {
        if (isActive()) {
            setValue("")
            //autoFocus fails with inputs but works with select above
            setTimeout(() => {
                const el = focus.current
                if (el) {
                    el.focus()
                    el.select()
                }
            }, 0)
        }
    }, [prompt.output])
    return (
        <Modal show={isActive()} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>{prompt.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Control autoFocus ref={focus} type="text" placeholder="Type Value"
                    onKeyPress={onKeyPress}
                    value={value} onChange={e => setValue(e.target.value)} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={onAccept} disabled={!isValid()}>
                    Send
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

function SvgWindow({ setts, controls, inputs, send, dispatch }) {
    const [hover, setHover] = useState(null)
    const [pressed, setPressed] = useState(null)
    const { ref, width, height } = useResizeDetector()
    if (!setts.scale) return <svg ref={ref} width="100%" height="100%" />
    const parent = { pw: width, ph: height }
    const { H, W, vb, sx, sy } = calcGeom(parent, setts)
    const controlList = controls.map((control, index) => {
        const csetts = control.setts
        const x = csetts.posX * sx
        const y = csetts.posY * sy
        const w = csetts.width * sx
        const h = csetts.height * sy
        const size = { width: w, height: h }
        const output = control.setts.output
        const hasHover = output && hover === index
        const hoverColor = setts.hvColor
        const isPressed = output && pressed === index
        const controller = Controls.getController(control.type)
        const controlInstance = controller.Renderer({ control, size, inputs, isPressed, hasHover, hoverColor })
        function onMouseAction(action) {
            switch (action) {
                case "enter": {
                    setHover(index)
                    break
                }
                case "leave": {
                    setHover(null)
                    setPressed(null)
                    break
                }
                case "down": {
                    setPressed(index)
                    break
                }
                case "up": {
                    if (isPressed) {
                        switch (csetts.click) {
                            case "Fixed Value": {
                                const name = output
                                const value = control.setts.value
                                send({ name: "write", args: { name, value } })
                                break
                            }
                            case "Value Prompt": {
                                const title = control.setts.prompt
                                dispatch({ name: "prompt", args: { output, title } })
                                break
                            }
                        }
                    }
                    setPressed(null)
                    break
                }
            }
        }
        const hoverStyle = hasHover ? { cursor: "pointer" } : {}
        return (
            <svg version="1.1" key={index} x={x} y={y} width={w} height={h}
                onMouseEnter={() => onMouseAction("enter")}
                onMouseLeave={() => onMouseAction("leave")}
                onMouseDown={() => onMouseAction("down")}
                onMouseUp={() => onMouseAction("up")}
                style={hoverStyle}>
                {controlInstance}
            </svg>
        )
    })
    return (<svg ref={ref} width="100%" height="100%">
        <rect width="100%" height="100%" fill={setts.bgColor} />
        <svg width="100%" height="100%" viewBox={vb} preserveAspectRatio='none'>
            {controlList}
        </svg>
    </svg >)
}

function View() {
    const app = useApp()
    const send = app.send
    const dispatch = app.dispatch
    const setts = app.state.setts
    const controls = app.state.controls
    const inputs = app.state.inputs
    const props = { setts, controls, inputs, send, dispatch }
    return <>
        <PromptValue />
        <SvgWindow {...props} />
    </>
}

export default View
