import Clipboard from '../tools/Clipboard'

function testConnectionString(app, database, connstr, dbpass, done) {
    connstr = connstr.replace("${PASSWORD}", dbpass)
    fetch("api/testconnstr", {
        method: "POST",
        body: JSON.stringify({ connstr, database }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(r => r.json())
        .then((r) => {
            switch (r.result) {
                case "ok":
                    app.successAlert("Successful connection!")
                    break;
                case "er":
                    Clipboard.copyText(r.error)
                    app.errorAlert(r.error)
                    break;
            }
            if (done) done()
        })
}

export default {
    testConnectionString,
}