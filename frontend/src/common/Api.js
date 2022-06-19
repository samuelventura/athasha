function fetchSerials(callback) {
    fetch("api/serials")
        .then(r => r.json())
        .then(l => callback(l))
}

function fetchLicenses(callback) {
    fetch("api/licenses")
    .then(r => r.json())
    .then(l => callback(l))
}

function installLicenses(list) {
    fetch("api/licenses", {
        method: "POST",
        body: JSON.stringify(list),
        headers: { 'Content-Type': 'application/json' }
    }).then(() => {
        fetch("api/update").then(() => window.location.reload())
    })
}

function checkLicenses() {
    fetch("api/check")
}

function refreshInfo() {
    fetch("api/update").then(() => window.location.reload())
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
    refreshInfo,
    fetchSerials,
    fetchLicenses,
    installLicenses,
    checkLicenses,
    testConnectionString,
}
