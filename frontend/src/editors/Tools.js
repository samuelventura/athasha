
function testConnectionString(app, database, connstr, dbpass) {
    connstr = connstr.replace("${PASSWORD}", dbpass)
    fetch("api/testconnstr", {
        method: "POST",
        body: JSON.stringify({ connstr, database }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(r => r.json())
        .then((r) => {
            console.log(r)
            switch (r.result) {
                case "ok":
                    app.successAlert("Successful connection!")
                    break;
                case "er":
                    navigator.clipboard.writeText(r.error)
                    app.errorAlert(r.error)
                    break;
            }
        })
}

export default {
    testConnectionString,
}