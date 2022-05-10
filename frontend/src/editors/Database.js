import Check from './Check'

function config() {
    return {
        setts: setts(),
        points: [point()],
    }
}

function setts() {
    return {
        connstr: "",
        command: "",
        database: "sqlserver",
        dbpass: "",
        period: "1",
        unit: "s",
    }
}

function point() {
    return { id: "" }
}

const labels = {
    database: "Database",
    dbpass: "Database Password",
    period: "Period",
    unit: "Unit",
    connstr: "Connection String",
    command: "SQL Command",
    points: {
        id: (i) => `Point ${i + 1}`,
    }
}

const hints = {
    database: "The type of database",
    dbpass: "Optional database password",
    period: "Non empty integer insert period > 0",
    unit: "One of the listed time units",
    connstr: "Non empty connection string for your DB\nUse ${PASSWORD} to insert the Database Password\nConsult your TI specialist\nSee https://www.connectionstrings.com/",
    command: "An SQL insert command, function or store procedure call\nUse @n to reference the nth point\nFor instance @1 references point 1\nConsult your TI specialist",
    points: {
        id: (i) => "Select the point name from the list",
    }
}

const checks = {
    database: function (value) {
        Check.isString(value, labels.database)
        Check.notEmpty(value, labels.database)
    },
    dbpass: function (value) {
        Check.isString(value, labels.dbpass)
        //Check.notEmpty(value, labels.dbpass)
    },
    period: function (value) {
        Check.isString(value, labels.period)
        Check.notEmpty(value, labels.period)
        Check.isInteger(value, labels.period)
        Check.isGT(value, labels.period, 0)
    },
    unit: function (value) {
        Check.isString(value, labels.unit)
        Check.inList(value, labels.unit, ["s", "m"])
    },
    connstr: function (value) {
        Check.isString(value, labels.connstr)
        Check.notEmpty(value, labels.connstr)
    },
    command: function (value) {
        Check.isString(value, labels.command)
        Check.notEmpty(value, labels.command)
    },
    points: {
        id: function (index, value) {
            Check.isString(value, labels.points.id(index))
            Check.notEmpty(value, labels.points.id(index))
        },
    }
}

function validator({ setts, points }) {
    Check.hasProp(setts, "Setts", "database")
    Check.hasProp(setts, "Setts", "dbpass")
    Check.hasProp(setts, "Setts", "period")
    Check.hasProp(setts, "Setts", "unit")
    Check.hasProp(setts, "Setts", "connstr")
    Check.hasProp(setts, "Setts", "command")
    checks.database(setts.database)
    checks.dbpass(setts.dbpass)
    checks.period(setts.period)
    checks.unit(setts.unit)
    checks.connstr(setts.connstr)
    checks.command(setts.command)
    Check.isArray(points, "Points")
    Check.nonZeroLength(points, "Points")
    points.forEach((point, index) => {
        Check.hasProp(point, labels.points.id(index), "id")
        checks.points.id(index, point.id)
    })
}

export default {
    config,
    setts,
    point,
    labels,
    hints,
    checks,
    validator,
}
