function config() {
    return {
        setts: setts(),
        controls: [],
        points: [],
    }
}

function setts() {
    return {
        period: "100",
        scale: 'fit', align: 'center',
        width: '640', height: '480',
        gridX: '10', gridY: '10',
        bgColor: "#ffffff",
        password: "",
    }
}

function control() {
    return {
        type: "none",
        setts: controlSetts(),
        data: {},
    }
}

function selected() {
    return {
        index: -1,
        control: {},
    }
}

function controlSetts() {
    return {
        posX: '0', posY: '0',
        width: '1', height: '1',
    }
}

export default {
    config,
    setts,
    control,
    selected,
    controlSetts,
}
