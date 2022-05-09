function config() {
    return {
        setts: setts(),
        inputs: [input()]
    }
}

function setts() {
    return {
        proto: "TCP",    //RTU
        trans: "Socket", //Serial
        host: "127.0.0.1",
        port: "502",
        tty: "COM1",
        speed: "9600",
        dbpsb: "8N1",
        period: "10",
    }
}

function input() {
    return { slave: "1", code: "01", address: "0", name: "Input 1" }
}

export default {
    config,
    setts,
    input,
}