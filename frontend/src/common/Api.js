function fetchSerials(setSerials) {
    fetch("api/serials")
        .then(r => r.json())
        .then(l => setSerials(l))
}

function testConnectionString(database, connstr, dbpass, callback) {
    connstr = connstr.replace("${PASSWORD}", dbpass)
    fetch("api/testconnstr", {
        method: "POST",
        body: JSON.stringify({ connstr, database }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(r => r.json())
        .then(r => callback(r))
}

export default {
    fetchSerials,
    testConnectionString,
}
