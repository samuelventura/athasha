function config() {
    return {
        setts: setts(),
        columns: [column("DateTime")],
    }
}

function setts() {
    return {
        connstr: "",
        command: "",
        database: "sqlserver",
        dbpass: "",
        password: "",
        ymin: "0",
        ymax: "100",
        lineWidth: "1",
    }
}

function column(name) {
    return { name: name || "", color: "#000000" }
}

export default {
    config,
    setts,
    column,
}
