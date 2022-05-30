import React from 'react'

function options(points) {
    return points.map(({ point, item }, index) => {
        const id = `${item.id} ${point.name}`
        const desc = `${item.name}/${point.name}`
        return <option key={id} value={id}>{desc}</option>
    })
}

export default { options }
