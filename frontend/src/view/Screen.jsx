import React, { useEffect } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { getController } from '../editors/Controls'
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

function SvgWindow({ setts, controls, points }) {
    const { ref } = useResizeDetector()
    let cw = 1
    let ch = 1
    if (!setts.scale) return null
    if (ref.current) {
        const style = window.getComputedStyle(ref.current)
        cw = Number(style.getPropertyValue("width").replace("px", ""))
        ch = Number(style.getPropertyValue("height").replace("px", ""))
    }
    const parent = { pw: cw, ph: ch }
    const { H, W, vb, sx, sy } = calcGeom(parent, setts)
    const controlList = controls.map((control, index) => {
        const setts = control.setts
        const x = setts.posX * sx
        const y = setts.posY * sy
        const w = setts.width * sx
        const h = setts.height * sy
        const size = { width: w, height: h }
        const controller = getController(control.type)
        const controlInstance = controller.Renderer({ control, size, points })
        return (
            <svg key={index} x={x} y={y} width={w} height={h}>
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
    const setts = app.state.setts
    const controls = app.state.controls
    const points = app.state.points
    return <SvgWindow setts={setts} controls={controls} points={points} />
}

export default View
