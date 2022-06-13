import Check from '../common/Check'
import Color from "../common/Color"
import Bases from '../common/Bases'
import Schema from '../common/Schema'

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
                value: databases[0],
                label: "Database",
                help: "Select the database type from the list",
                check: function (value, label) {
                    Check.inList(value, label, databases)
                },
            },
            connstr: {
                value: "Server=10.77.3.211;Database=AthashaDemos;User Id=sa;Password=${PASSWORD};Encrypt=false;Connection Timeout=2;",
                label: "Connection String",
                help: "Non empty connection string for your DB"
                    + "\nUse ${PASSWORD} to insert the Database Password"
                    + "\nConsult your IT specialist"
                    + "\nSee https://www.connectionstrings.com/",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            command: {
                value: "SELECT DT, FuelLevel FROM Datalog WHERE DT>=@FROM AND DT<=@TO",
                label: "SQL Command",
                help: "An SQL select command, function or store procedure call"
                    + "\nUse @FROM and @TO to reference the start and end of the date range"
                    + "\nFirst returned column must be DateTime"
                    + "\nConsult your IT specialist",
                check: function (value, label) {
                    Check.notEmpty(value, label)
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
            password: {
                value: "",
                label: "Access Password",
                help: "Optional access password",
                check: function (value, label) {
                    Check.isString(value, label)
                },
            },
            ymin: {
                value: "0",
                label: "Min Y Value",
                help: "Non empty number",
                check: function (value, label) {
                    Check.isNumber(value, label)
                },
            },
            ymax: {
                value: "10000",
                label: "Max Y Value",
                help: "Non empty number",
                check: function (value, label) {
                    Check.isNumber(value, label)
                },
            },
            yformat: {
                value: "0,0",
                label: "Y Tick Format",
                help: "Use 0.00 for 2 decimal digits",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            ywidth: {
                value: "80",
                label: "Y Width",
                help: "Non empty integer > 0",
                check: function (value, label) {
                    Check.isGE(value, label, 0)
                },
            },
            lineWidth: {
                value: "2",
                label: "Line Width",
                help: "Non empty integer > 0",
                check: function (value, label) {
                    Check.isGE(value, label, 1)
                },
            },
        },
        columns: {
            $type: "array",
            $value: (value) => [value(0), { name: "Fuel Level", color: Color.unique(1) }],
            $check: function (value, label) {
                Check.notEmptyArray(value, label)
            },
            name: {
                value: (index) => index ? `Column ${index + 1}` : "DateTime",
                header: "Column Name",
                label: (index) => `Column ${index + 1} Name`,
                help: "Non empty column name",
                check: function (value, label) {
                    Check.notEmpty(value, label)
                },
            },
            color: {
                value: (index) => Color.unique(index),
                header: "Column Color",
                label: (index) => `Column ${index + 1} Color`,
                help: "Non empty column color #RRGGBB",
                check: function (value, label) {
                    Check.isColor(value, label)
                },
            },
        },
    }
}

function column(index) {
    const $type = "object"
    const prop = { ...schema().columns, $type }
    return Schema.value(prop, index)
}

export default {
    schema,
    databases,
    column,
}
