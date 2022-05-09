const pointers = {
    Modbus: function(item, add) {
        item.config.inputs.forEach(point => {
            if (point.name.trim().length > 0) {
                add({
                    point: { name: point.name },
                    item: { id: item.id, name: item.name }
                })
            }
        })
    },
    Laurel: function(item, add) {
        item.config.slaves.forEach(slave => {
            slave.inputs.forEach(point => {
                if (point.name.trim().length > 0) {
                    add({
                        point: { name: point.name },
                        item: { id: item.id, name: item.name }
                    })
                }
            })
        })
    },
    Opto22: function(item, add) {
        item.config.inputs.forEach(point => {
            if (point.name.trim().length > 0) {
                add({
                    point: { name: point.name },
                    item: { id: item.id, name: item.name }
                })
            }
        })
    },
}

function nop () {}

export default function(type) {
    return pointers[type] || nop
}
