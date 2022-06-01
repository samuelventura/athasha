import Check from '../common/Check'
import Merge from "../tools/Merge"

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

const databases = ["SQL Server"]
const units = ["Second(s)", "Minute(s)"]

function config() {
    return {
        setts: setts(),
        inputs: [input()],
    }
}

function setts() {
    return {
        connstr: "",
        command: "",
        database: databases[0],
        dbpass: "",
        period: "1",
        unit: units[0],
    }
}

function input() {
    return {
        id: "",
    }
}

const labels = {
    database: "Database",
    dbpass: "Database Password",
    period: "Period",
    unit: "Unit",
    connstr: "Connection String",
    command: "SQL Command",
    input: {
        id: "Input Name",
    },
    inputs: {
        id: (i) => `Input ${i + 1}`,
    }
}

const hints = {
    database: "Select the database type from the list",
    dbpass: "Optional database password",
    period: "Non empty integer insert period > 0",
    unit: "Select time unit from the list",
    connstr: "Non empty connection string for your DB"
        + "\nUse ${PASSWORD} to insert the Database Password"
        + "\nConsult your IT specialist"
        + "\nSee https://www.connectionstrings.com/",
    command: "An SQL insert command, function or store procedure call"
        + "\nUse @n to reference the nth input"
        + "\nFor instance @1 references input 1"
        + "\nConsult your IT specialist",
    inputs: {
        id: () => "Select the input name from the list",
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
    connstr: function (value) {
        Check.isString(value, labels.connstr)
        Check.notEmpty(value, labels.connstr)
    },
    command: function (value) {
        Check.isString(value, labels.command)
        Check.notEmpty(value, labels.command)
    },
    inputs: {
        id: function (index, value) {
            Check.isString(value, labels.inputs.id(index))
            Check.notEmpty(value, labels.inputs.id(index))
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
