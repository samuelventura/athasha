import React from 'react'
import Types from './Types'
import { useApp } from '../App'

function list() {
    const app = useApp()
    const items = app.state.items
    const points = []
    function add(point) { points.push(point) }
    Object.values(items).forEach((item) => {
        Types.pointer(item.type)(item, add)
    })
    return points
}

function options() {
    return list().map(({ point, item }, index) => {
        const id = `${item.id} ${point.name}`
        const desc = `${item.name}/${point.name}`
        return <option key={index} value={id}>{desc}</option>
    })
}

export default { list, options }
