function fetchSerials(setSerials) {
    fetch("api/serials")
        .then(r => r.json())
        .then(l => setSerials(l))
}

export default {
    fetchSerials,
}
