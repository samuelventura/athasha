function config() {
    return {
        setts: setts(),
        inputs: [input()]
    }
}

function setts() {
    return {
        type: "Snap",
        host: "127.0.0.1",
        port: "502",
        period: "10",
        slave: "1",
    }
}

function input() {
    return { code: "01", module: "0", number: "0", name: "Input 1" }
}

export default {
    config,
    setts,
    input,
}