const inputs = {
    Modbus: function (item, add) {
        item.config.inputs.forEach(point => {
            if (point.name.trim().length > 0) {
                add({
                    point: { name: point.name },
                    item: { id: item.id, name: item.name }
                })
            }
        })
    },
    Opto22: function (item, add) {
        item.config.inputs.forEach(point => {
            if (point.name.trim().length > 0) {
                add({
                    point: { name: point.name },
                    item: { id: item.id, name: item.name }
                })
            }
        })
    },
    Laurel: function (item, add) {
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
    Datafetch: function (item, add) {
        item.config.inputs.forEach(input => {
            if (input.name.trim().length > 0) {
                add({
                    point: { name: input.name },
                    item: { id: item.id, name: item.name }
                })
            }
        })
    },
}

const outputs = {
    Modbus: function (item, add) {
        item.config.outputs.forEach(point => {
            if (point.name.trim().length > 0) {
                add({
                    point: { name: point.name },
                    item: { id: item.id, name: item.name }
                })
            }
        })
    },
    Opto22: function (item, add) {
        item.config.outputs.forEach(point => {
            if (point.name.trim().length > 0) {
                add({
                    point: { name: point.name },
                    item: { id: item.id, name: item.name }
                })
            }
        })
    },
    Laurel: function (item, add) {
        item.config.slaves.forEach(slave => {
            slave.outputs.forEach(point => {
                if (point.name.trim().length > 0) {
                    add({
                        point: { name: point.name },
                        item: { id: item.id, name: item.name }
                    })
                }
            })
        })
    },
}

function nop() { }

const exports = {
    inputs: function (item, add) {
        const extractor = inputs[item.type] || nop
        extractor(item, add)
    },
    outputs: function (item, add) {
        const extractor = outputs[item.type] || nop
        extractor(item, add)
    },
}

export default exports
