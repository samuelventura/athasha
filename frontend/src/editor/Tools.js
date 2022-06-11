import Clipboard from '../tools/Clipboard'
import Api from '../common/Api'

function testConnectionString(app, database, connstr, dbpass, done) {
    Api.testConnectionString(database, connstr, dbpass, (r) => {
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