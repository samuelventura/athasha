import React, { useState } from 'react'
import { useResizeDetector } from 'react-resize-detector'
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

function SvgWindow({ setts, controls, inputs, send }) {
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
                        const name = output
                        const value = control.setts.value
                        send({ name: "write", args: { name, value } })
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
    const setts = app.state.setts
    const controls = app.state.controls
    const inputs = app.state.inputs
    const props = { setts, controls, inputs, send }
    return <SvgWindow {...props} />
}

export default View
