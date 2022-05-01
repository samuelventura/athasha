import React from 'react'

function PointLister(app) {
    const items = Object.values(app.state.items).filter(item => item.type === 'Modbus')
    return items.map((item) => {
        const config = item.config
        return config.points.map(point => {
            return {
                point: point,
                item: { id: item.id, name: item.name }
            }
        })
    }).flat()
}

function PointOptions(app) {
    return PointLister(app).map(({ point, item }, index) => {
        const id = `${item.id} ${point.name}`
        const desc = `${item.name}/${point.name}`
        return <option key={index} value={id}>{desc}</option>
    })
}

export { PointLister, PointOptions }
