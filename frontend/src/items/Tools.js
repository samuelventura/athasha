import Environ from '../Environ'

function testConnectionString(app, database, connstr, dbpass, done) {
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
                    safeCopy(r.error)
                    app.errorAlert(r.error)
                    break;
            }
            if (done) done()
        })
}

function safeCopy(txt) {
    try {
        //ff Uncaught (in promise) DOMException: Clipboard write was blocked due to lack of user activation.
        navigator.clipboard.writeText(txt)
    } catch (ex) {
        Environ.log(ex)
    }
}

export default {
    testConnectionString,
    safeCopy,
}