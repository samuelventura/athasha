function config() {
    return {
        setts: setts(),
        slaves: [slave()]
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

function slave() {
    return {
        address: "1",
        decimals: "0",
        inputs: [input()],
    }
}

function input() {
    return { code: "01", name: "Input 1" }
}

export default {
    config,
    setts,
    slave,
    input,
}