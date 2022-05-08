import React from 'react'

function modbusPointAppender(item, points) {
    item.config.points.forEach(point => {
        if (point.name.trim().length > 0) {
            points.push({
                point: { name: point.name },
                item: { id: item.id, name: item.name }
            })
        }
    })
}

function laurelPointAppender(item, points) {
    item.config.slaves.forEach(slave => {
        slave.points.forEach(point => {
            if (point.name.trim().length > 0) {
                points.push({
                    point: { name: point.name },
                    item: { id: item.id, name: item.name }
                })
            }
        })
    })
}

function opto22PointAppender(item, points) {
    item.config.points.forEach(point => {
        if (point.name.trim().length > 0) {
            points.push({
                point: { name: point.name },
                item: { id: item.id, name: item.name }
            })
        }
    })
}

const pointAppender = {
    "Modbus": modbusPointAppender,
    "Laurel": laurelPointAppender,
    "Opto22": opto22PointAppender,
}

function PointLister(app) {
    const points = []
    Object.values(app.state.items).forEach((item) => {
        const appender = pointAppender[item.type]
        if (appender) appender(item, points)
    })
    return points
}

function PointOptions(app) {
    return PointLister(app).map(({ point, item }, index) => {
        const id = `${item.id} ${point.name}`
        const desc = `${item.name}/${point.name}`
        return <option key={index} value={id}>{desc}</option>
    })
}

export { PointLister, PointOptions }
