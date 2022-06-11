import React from 'react'

function options(points) {
    return points.map(({ point, item }) => {
        const id = `${item.id} ${point.name}`
        const desc = `${point.name}`
        return <option key={id} value={id}>{desc}</option>
    })
}

export default { options }
