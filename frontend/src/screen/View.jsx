import React, { useState, useRef, useEffect } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Controller from '../common/Controller'
import Focus from '../common/Focus'
import Svg from '../common/Svg'
import Input from './Input'
import { useApp } from '../App'

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

function PromptValue() {
    const app = useApp()
    const prompt = app.state.prompt
    const string = prompt.string
    const focus = useRef(null)
    const [value, setValue] = useState("")
    const hasOptions = (typeof prompt.options == "string")
    function isActive() { return !!prompt.output && !hasOptions }
    function isValid() {
        const stringType = typeof value === 'string'
        const nonEmpty = stringType && value.trim().length > 0
        const validNumber = nonEmpty && isFinite(value)
        return string ? nonEmpty : validNumber
    }
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
            const fixed = string ? value : prompt.scaler(value) //Number(x) conversion supports 0xFF
            app.send({ name: "write", args: { name, value: fixed, string } })
            app.dispatch({ name: "prompt", args: {} })
        }
    }
    useEffect(() => {
        if (isActive()) {
            setValue("")
            Focus.autoFocus(focus)
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

function SelectValue() {
    const app = useApp()
    const prompt = app.state.prompt
    const string = prompt.string
    const focus = useRef(null)
    const [value, setValue] = useState("")
    //options are initially empty, show dialog but should fail valid below
    const hasOptions = (typeof prompt.options == "string")
    function isActive() { return !!prompt.output && hasOptions }
    function isValid() {
        const stringType = typeof value === 'string'
        const nonEmpty = stringType && value.trim().length > 0
        const validNumber = nonEmpty && isFinite(value)
        return string ? nonEmpty : validNumber
    }
    const options = isActive() ? prompt.options.split('\n') : [""]
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
            const fixed = string ? value : prompt.scaler(value)
            app.send({ name: "write", args: { name, value: fixed, string } })
            app.dispatch({ name: "prompt", args: {} })
        }
    }
    useEffect(() => {
        if (isActive()) {
            setValue(options[0])
            Focus.autoFocus(focus)
        }
    }, [prompt.output])
    const optionItems = options.map(v => <option key={v} value={v}>{v}</option>)
    return (
        <Modal show={isActive()} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>{prompt.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Select autoFocus ref={focus} value={value}
                    placeholder="Select Value"
                    onChange={e => setValue(e.target.value)}
                    onKeyPress={onKeyPress}>
                    {optionItems}
                </Form.Select>
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

function SvgWindow({ setts, controls, inputs, trends, send, dispatch }) {
    const [hover, setHover] = useState(null)
    const [pressed, setPressed] = useState(null)
    const { ref, width, height } = useResizeDetector()
    if (!setts.scale) return <svg ref={ref} width="100%" height="100%" />
    const parent = { pw: width, ph: height }
    const { vb, sx, sy, W, H } = calcGeom(parent, setts)
    const background = setts.backColor
    const controlList = controls.map((control, index) => {
        const csetts = control.setts
        const x = csetts.posX * sx
        const y = csetts.posY * sy
        const w = csetts.width * sx
        const h = csetts.height * sy
        const size = { width: w, height: h }
        const output = csetts.output
        const link = csetts.linkURL.trim()
        const click = !!(output || link)
        const input = csetts.input
        const hasHover = click && hover === index
        const hoverColor = setts.hoverColor
        const isPressed = click && pressed === index
        const controller = Controller.get(control.type)
        const scaler = (value) => {
            //Number(x) conversion supports 0xFF from prompt modal
            return Number(value) * Number(csetts.outputFactor) + Number(csetts.outputOffset)
        }
        const string = csetts.istring
        const value = Input.getter(csetts, inputs)
        const trend = input ? trends[input] : null
        const controlInstance = controller.Renderer({ control, size, string, value, trend, click, isPressed, hasHover, hoverColor, background })
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
                        if (output) {
                            switch (csetts.click) {
                                case "Fixed Value": {
                                    const name = output
                                    const string = control.setts.ostring
                                    const value = string ? control.setts.svalue : scaler(control.setts.value)
                                    send({ name: "write", args: { name, value, string } })
                                    break
                                }
                                case "Value Prompt": {
                                    const title = control.setts.prompt
                                    const string = control.setts.ostring
                                    dispatch({ name: "prompt", args: { output, title, string, scaler } })
                                    break
                                }
                                case "Value Selector": {
                                    const title = control.setts.prompt
                                    const string = control.setts.ostring
                                    const options = control.setts.options
                                    dispatch({ name: "prompt", args: { output, title, string, scaler, options } })
                                    break
                                }
                            }
                        } else if (link) {
                            if (csetts.linkBlank) window.open(link, '_blank').focus()
                            else window.location = link
                        }
                    }
                    setPressed(null)
                    break
                }
            }
        }
        const title = csetts.title
        const classes = click ? "click" : ""
        const overlay = <Tooltip>{title}</Tooltip>
        const trigger = title ? ['hover', 'focus'] : []
        //it would be ideal to draw the transparent click background here but
        //that would be rectangular and overriding of any border rounding
        //no mouse event received after modal closes with pointer still within boudaries
        return (
            <OverlayTrigger
                placement="auto"
                overlay={overlay}
                trigger={trigger}
                key={control.id}
            >
                <svg version="1.1" x={x} y={y} width={w} height={h}
                    onMouseEnter={() => onMouseAction("enter")}
                    // onMouseOver={() => onMouseAction("enter")}
                    onMouseMove={() => onMouseAction("enter")}
                    onMouseLeave={() => onMouseAction("leave")}
                    onMouseDown={() => onMouseAction("down")}
                    onMouseUp={() => onMouseAction("up")}
                    className={classes}>
                    {controlInstance}
                </svg>
            </OverlayTrigger >
        )
    })

    const bgValid = !!setts.background.viewBox
    const bgImage = bgValid ? Svg.render(setts.background) : null
    return (<svg ref={ref} width="100%" height="100%">
        <rect width="100%" height="100%" fill={background} />
        <svg width="100%" height="100%" viewBox={vb} preserveAspectRatio='none'>
            <svg width={W} height={H}>{bgImage}</svg>
            {controlList}
        </svg>
    </svg >)
}

function View() {
    const app = useApp()
    const send = app.send
    const dispatch = app.dispatch
    const state = app.state
    const setts = state.setts
    const controls = state.controls
    const inputs = state.inputs
    const trends = state.trends
    const props = { setts, controls, inputs, trends, send, dispatch }
    return <>
        <PromptValue />
        <SelectValue />
        <SvgWindow {...props} />
    </>
}

export default View
