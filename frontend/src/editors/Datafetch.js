import Check from '../common/Check'
import Merge from "../common/Merge"

function merge(target) {
    const _initial = config()
    Merge(_initial, target)
    Merge(_initial.setts, target.setts, (name, value) => checks[name](value))
    target.inputs.forEach((target, index) => {
        const _initial = input(index)
        Merge(_initial, target, (name, value) => checks.inputs[name](index, value))
    })
    return target
}

function config() {
    return {
        setts: setts(),
        inputs: [input(0)],
    }
}

const databases = ["SQL Server"]
const units = ["Second(s)", "Minute(s)"]

function setts() {
    return {
        database: databases[0],
        dbpass: "",
        connstr: "",
        command: "",
        password: "",
        period: "1",
        unit: units[0],
    }
}

function input(index) {
    index = index || 0
    const name = `Input ${index + 1}`
    return {
        name,
    }
}

const labels = {
    database: "Database",
    dbpass: "Database Password",
    period: "Period",
    unit: "Unit",
    password: "Access Password",
    connstr: "Connection String",
    command: "SQL Command",
    input: {
        name: "Input Name",
    },
    inputs: {
        name: (i) => `Input ${i + 1} Name`,
    }
}

const hints = {
    database: "Select the database type from the list",
    dbpass: "Optional database password",
    period: "Non empty integer insert period > 0",
    unit: "Select time unit from the list",
    password: "Optional access password",
    connstr: "Non empty connection string for your DB"
        + "\nUse ${PASSWORD} to insert the Database Password"
        + "\nConsult your IT specialist"
        + "\nSee https://www.connectionstrings.com/",
    command: "An SQL select command, function or store procedure call"
        + "\nQuery must return equal number of columns as added inputs"
        + "\nConsult your IT specialist",
    inputs: {
        name: () => "Non empty input name",
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
    period: function (value) {
        Check.isString(value, labels.period)
        Check.notEmpty(value, labels.period)
        Check.isInteger(value, labels.period)
        Check.isGE(value, labels.period, 1)
    },
    unit: function (value) {
        Check.isString(value, labels.unit)
        Check.inList(value, labels.unit, units)
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
    inputs: {
        name: function (index, value) {
            Check.isString(value, labels.inputs.name(index))
            Check.notEmpty(value, labels.inputs.name(index))
        },
    }
}

export default {
    databases,
    units,
    merge,
    config,
    setts,
    input,
    labels,
    hints,
    checks,
}
