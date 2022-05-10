import Check from './Check'

function config() {
    return {
        setts: setts(),
        controls: [],
        points: [],
    }
}

function setts() {
    return {
        password: "",
        period: "100",
        scale: 'fit',
        align: 'center',
        width: '640',
        height: '480',
        gridX: '10',
        gridY: '10',
        bgColor: "#ffffff",
    }
}

function control() {
    return {
        type: "none",
        setts: csetts(),
        data: {},
    }
}

function selected() {
    return {
        index: -1,
        control: {},
    }
}

function csetts() {
    return {
        posX: '0',
        posY: '0',
        width: '1',
        height: '1',
    }
}

const labels = {
    password: "Password",
    period: "Period (ms)",
    scale: "Scale",
    align: "Align",
    width: "Width",
    height: "Height",
    gridX: "Grid X",
    gridY: "Grid Y",
    bgColor: "Background",
}

const hints = {
    password: "Optional screen password",
    period: "Non empty integer insert period > 0",
    scale: "Select scale from list",
    align: "Select align from list",
    width: "Non empty integer > 0",
    height: "Non empty integer > 0",
    gridX: "Non empty integer > 0",
    gridY: "Non empty integer > 0",
    bgColor: "Non empty backgroung color #RRGGBB",
}

function fixSetts(curr) {
    const next = {}
    const init = setts()
    Object.keys(curr).forEach((k) => {
        const value = curr[k]
        try {
            checks[k](value)
            next[k] = value
        } catch (ex) {
            next[k] = init[k]
        }
    })
    return next
}

const checks = {
    password: function (value) {
        Check.isString(value, labels.password)
        //Check.notEmpty(value, labels.password)
    },
    period: function (value) {
        Check.isString(value, labels.period)
        Check.notEmpty(value, labels.period)
        Check.isInteger(value, labels.period)
        Check.isGT(value, labels.period, 0)
    },
    scale: function (value) {
        Check.isString(value, labels.scale)
        Check.notEmpty(value, labels.scale)
    },
    align: function (value) {
        Check.isString(value, labels.align)
        Check.notEmpty(value, labels.align)
    },
    width: function (value) {
        Check.isString(value, labels.width)
        Check.notEmpty(value, labels.width)
        Check.isInteger(value, labels.width)
        Check.isGT(value, labels.width, 0)
    },
    height: function (value) {
        Check.isString(value, labels.height)
        Check.notEmpty(value, labels.height)
        Check.isInteger(value, labels.height)
        Check.isGT(value, labels.height, 0)
    },
    gridX: function (value) {
        Check.isString(value, labels.gridX)
        Check.notEmpty(value, labels.gridX)
        Check.isInteger(value, labels.gridX)
        Check.isGT(value, labels.gridX, 0)
    },
    gridY: function (value) {
        Check.isString(value, labels.gridY)
        Check.notEmpty(value, labels.gridY)
        Check.isInteger(value, labels.gridY)
        Check.isGT(value, labels.gridY, 0)
    },
    bgColor: function (value) {
        Check.isString(value, labels.bgColor)
        Check.notEmpty(value, labels.bgColor)
        Check.isColor(value, labels.bgColor)
    },
}

function validator({ setts }) {
    Check.hasProp(setts, "Setts", "password")
    Check.hasProp(setts, "Setts", "period")
    Check.hasProp(setts, "Setts", "scale")
    Check.hasProp(setts, "Setts", "align")
    Check.hasProp(setts, "Setts", "width")
    Check.hasProp(setts, "Setts", "height")
    Check.hasProp(setts, "Setts", "gridX")
    Check.hasProp(setts, "Setts", "gridY")
    Check.hasProp(setts, "Setts", "bgColor")
    checks.password(setts.password)
    checks.period(setts.period)
    checks.scale(setts.scale)
    checks.align(setts.align)
    checks.width(setts.width)
    checks.height(setts.height)
    checks.gridX(setts.gridX)
    checks.gridY(setts.gridY)
    checks.bgColor(setts.bgColor)
}

export default {
    selected,
    config,
    setts,
    control,
    csetts,
    labels,
    hints,
    checks,
    validator,
    fixSetts,
}
