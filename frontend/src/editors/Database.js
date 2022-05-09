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
}

//FIXME enforce html validation
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
        //FIXME enforce limits
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
        const label = `Point ${index + 1}`
        Check.hasProp(point, label, "id")
        Check.isString(point.id, label)
        Check.notEmpty(point.id, label)
    })
}

export default {
    config,
    setts,
    point,
    labels,
    checks,
    validator,
}
