import Check from '../common/Check'
import Bases from '../common/Bases'
import Schema from '../common/Schema'

const units = ["Second(s)", "Minute(s)"]
const databases = Bases.databases

//connstr and command defaults for two reasons
//1. default should provide a working demo
//2. non-empty required for merge to fail validaiton
//Encrypt=false
//TrustServerCertificate=True
function schema() {
    return {
        $type: "object",
        setts: {
            $type: "object",
            database: {
                label: "Database",
                value: databases[0],
                help: "Select the database type from the list",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                    Check.inList(value, label, databases)
                },
            },
            connstr: {
                label: "Connection String",
                value: "Server=10.77.3.211;Database=AthashaDemos;User Id=sa;Password=${PASSWORD};Encrypt=false;Connection Timeout=2;",
                help: "Non empty connection string for your DB"
                    + "\nUse ${PASSWORD} to insert the Database Password"
                    + "\nConsult your IT specialist"
                    + "\nSee https://www.connectionstrings.com/",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            command: {
                label: "SQL Command",
                value: "SELECT UpperLimit FROM Datafetch WHERE PartNumber='PN001'",
                help: "An SQL select command, function or store procedure call"
                    + "\nQuery must return equal number of columns as added inputs"
                    + "\nConsult your IT specialist",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            dbpass: {
                label: "Database Password",
                value: "",
                help: "Optional database password",
                check: function (value, label) {
                    Check.isString(value, label)
                },
            },
            password: {
                label: "Access Password",
                value: "",
                help: "Optional access password",
                check: function (value, label) {
                    Check.isString(value, label)
                },
            },
            period: {
                label: "Period",
                value: "1",
                help: "Non empty integer insert period > 0",
                check: function (value, label) {
                    Check.isInteger(value, label)
                    Check.isGE(value, label, 1)
                },
            },
            unit: {
                label: "Unit",
                value: units[0],
                help: "Select time unit from the list",
                check: function (value, label) {
                    Check.inList(value, label, units)
                },
            },
        },
        inputs: {
            $type: "array",
            $value: [{ name: "Upper Limit" }],
            name: {
                value: (index) => `Input ${index + 1}`,
                header: "Input Name",
                label: (index) => `Input ${index + 1} Name`,
                help: "Non empty input name",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            }
        }
    }
}

function input(index) {
    const $type = "object"
    const prop = { ...schema().inputs, $type }
    return Schema.value(prop, index)
}

export default {
    schema,
    units,
    databases,
    input,
}
