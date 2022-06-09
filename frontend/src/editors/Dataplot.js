import Check from '../common/Check'
import Merge from "../common/Merge"
import Color from "../common/Color"

function merge(target) {
    const _initial = config()
    Merge.apply(_initial, target)
    Merge.apply(_initial.setts, target.setts, (name, value) => checks[name](value))
    target.columns.forEach((target, index) => {
        const _initial = column(index)
        Merge.apply(_initial, target, (name, value) => checks.columns[name](index, value))
    })
    return target
}

const databases = ["SQL Server"]

function config() {
    return {
        setts: setts(),
        columns: [column(0), column(1)],
    }
}

//connstr and command defaults for two reasons
//1. default should provide a working demo
//2. non-empty required for merge to fail validaiton
//Encrypt=false
//TrustServerCertificate=True
function setts() {
    return {
        database: databases[0],
        connstr: "Server=10.77.3.211;Database=datalog;User Id=sa;Password=${PASSWORD};Encrypt=false;Connection Timeout=2;",
        command: "SELECT DT, COL1 FROM dataplot WHERE DT>=@FROM AND DT<=@TO",
        dbpass: "",
        password: "",
        ymin: "0",
        ymax: "100",
        yformat: "0",
        ywidth: "60",
        lineWidth: "1",
    }
}

function column(index) {
    index = index || 0
    const name = index ? `Column ${index + 1}` : "DateTime"
    const color = Color.unique(index)
    return {
        name,
        color
    }
}

const labels = {
    database: "Database",
    dbpass: "Database Password",
    password: "Access Password",
    connstr: "Connection String",
    command: "SQL Command",
    ymin: "Min Y Value",
    ymax: "Max Y Value",
    yformat: "Y Tick Format",
    ywidth: "Y Width",
    lineWidth: "Line Width",
    column: {
        name: "Column Name",
        color: "Column Color",
    },
    columns: {
        name: (i) => `Column ${i + 1} Name`,
        color: (i) => `Column ${i + 1} Color`,
    }
}

const hints = {
    database: "Select the database type from the list",
    dbpass: "Optional database password",
    password: "Optional access password",
    connstr: "Non empty connection string for your DB"
        + "\nUse ${PASSWORD} to insert the Database Password"
        + "\nConsult your IT specialist"
        + "\nSee https://www.connectionstrings.com/",
    command: "An SQL select command, function or store procedure call"
        + "\nUse @FROM and @TO to reference the start and end of the date range"
        + "\nFirst returned column must be DateTime"
        + "\nConsult your IT specialist",
    ymin: "Non empty number",
    ymax: "Non empty number",
    yformat: "Use 0.00 for 2 decimal digits",
    ywidth: "Non empty integer > 0",
    lineWidth: "Non empty integer > 0",
    columns: {
        name: () => "Non empty column name",
        color: () => "Non empty column color #RRGGBB",
    }
}

const checks = {
    database: function (value) {
        Check.isString(value, labels.database)
        Check.notEmpty(value, labels.database)
        Check.inList(value, labels.database, databases)
    },
    dbpass: function (value) {
        Check.isString(value, labels.dbpass)
        //Check.notEmpty(value, labels.dbpass)
    },
    password: function (value) {
        Check.isString(value, labels.password)
        //Check.notEmpty(value, labels.password)
    },
    connstr: function (value) {
        Check.isString(value, labels.connstr)
        Check.notEmpty(value, labels.connstr)
    },
    command: function (value) {
        Check.isString(value, labels.command)
        Check.notEmpty(value, labels.command)
    },
    ymin: function (value) {
        Check.isString(value, labels.ymin)
        Check.notEmpty(value, labels.ymin)
        Check.isNumber(value, labels.ymin)
    },
    ymax: function (value) {
        Check.isString(value, labels.ymax)
        Check.notEmpty(value, labels.ymax)
        Check.isNumber(value, labels.ymax)
    },
    yformat: function (value) {
        Check.isString(value, labels.yformat)
        Check.notEmpty(value, labels.yformat)
    },
    ywidth: function (value) {
        Check.isString(value, labels.ywidth)
        Check.notEmpty(value, labels.ywidth)
        Check.isInteger(value, labels.ywidth)
        Check.isGE(value, labels.ywidth, 0)
    },
    lineWidth: function (value) {
        Check.isString(value, labels.lineWidth)
        Check.notEmpty(value, labels.lineWidth)
        Check.isInteger(value, labels.lineWidth)
        Check.isGE(value, labels.lineWidth, 1)
    },
    columns: {
        name: function (index, value) {
            Check.isString(value, labels.columns.name(index))
            Check.notEmpty(value, labels.columns.name(index))
        },
        color: function (index, value) {
            Check.isString(value, labels.columns.color(index))
            Check.notEmpty(value, labels.columns.color(index))
            Check.isColor(value, labels.columns.color(index))
        },
    }
}

export default {
    databases,
    merge,
    config,
    setts,
    column,
    labels,
    hints,
    checks,
}
