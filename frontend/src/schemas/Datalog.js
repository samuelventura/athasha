import Check from '../common/Check'
import Bases from '../common/Bases'

const units = ["Second(s)", "Minute(s)"]

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
            connstr: {
                value: "Server=10.77.3.211;Database=datalog;User Id=sa;Password=${PASSWORD};Encrypt=false;Connection Timeout=2;",
                label: "Connection String",
                help: "Non empty connection string for your DB"
                    + "\nUse ${PASSWORD} to insert the Database Password"
                    + "\nConsult your IT specialist"
                    + "\nSee https://www.connectionstrings.com/",
                check: function (value, label) {
                    Check.isString(value, label)
                    Check.notEmpty(value, label)
                },
            },
            command: {
                value: "INSERT INTO dataplot (COL1) VALUES (@1)",
                label: "SQL Command",
                help: "An SQL insert command, function or store procedure call"
                    + "\nUse @n to reference the nth input"
                    + "\nFor instance @1 references input 1"
                    + "\nConsult your IT specialist",
                check: function (value, label) {
                    Check.isString(value, label)
                    Check.notEmpty(value, label)
                },
            },
            database: {
                value: Bases.databases[0],
                label: "Database",
                help: "Select the database type from the list",
                check: function (value, label) {
                    Check.inList(value, label, Bases.databases)
                },
            },
            dbpass: {
                value: "",
                label: "Database Password",
                help: "Optional database password",
                check: function (value, label) {
                    Check.isString(value, label)
                },

            },
            period: {
                value: "1",
                label: "Period",
                help: "Non empty integer insert period > 0",
                check: function (value, label) {
                    Check.isGE(value, label, 1)
                },
            },
            unit: {
                value: units[0],
                label: "Unit",
                help: "Select time unit from the list",
                check: function (value, label) {
                    Check.inList(value, label, units)
                },
            },
        },
        inputs: {
            $type: "array",
            $value: (value) => [value(0)],
            id: {
                value: "",
                header: "Input Name",
                label: (index) => `Input ${index + 1}`,
                help: "Select the input name from the list",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            }
        },
    }
}

export default {
    units,
    schema,
}
