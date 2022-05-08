
const configList = ["8N1", "8E1", "8O1", "8N2", "8E2", "8O2", "7N1", "7E1", "7O1", "7N2", "7E2", "7O2"]

function fetchSerials(setSerials) {
    fetch("api/serials")
        .then(r => r.json())
        .then(l => setSerials(l))
}

export default {
    configList,
    fetchSerials,
}
