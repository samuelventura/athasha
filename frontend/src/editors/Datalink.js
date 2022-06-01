import Check from '../common/Check'
import Merge from "../tools/Merge"

function merge(target) {
    const _initial = config()
    Merge(_initial, target)
    Merge(_initial.setts, target.setts, (name, value) => checks[name](value))
    target.links.forEach((target, index) => {
        const _initial = link(index)
        Merge(_initial, target, (name, value) => checks.links[name](index, value))
    })
    return target
}

function config() {
    return {
        setts: setts(),
        links: [link()],
    }
}

function setts() {
    return {
        period: "25",
    }
}

function link() {
    return {
        input: "",
        output: "",
        factor: "1",
        offset: "0",
    }
}

const labels = {
    period: "Period (ms)",
    link: {
        input: "Input Name",
        output: "Output Name",
        factor: "Value Factor",
        offset: "Value Offset",
    },
    links: {
        input: (i) => `Input ${i + 1}`,
        output: (i) => `Output ${i + 1}`,
        factor: (i) => `Link ${i + 1} Factor`,
        offset: (i) => `Link ${i + 1} Offset`,
    }
}

const hints = {
    period: "Non empty integer period > 0",
    links: {
        input: () => "Select the input name from the list",
        output: () => "Select the output name from the list",
        factor: () => "Non zero number m in f(x)=m*x+b",
        offset: () => "Non empty number b in f(x)=m*x+b",
    }
}

const checks = {
    period: function (value) {
        Check.isString(value, labels.period)
        Check.notEmpty(value, labels.period)
        Check.isInteger(value, labels.period)
        Check.isGE(value, labels.period, 1)
    },
    links: {
        input: function (index, value) {
            Check.isString(value, labels.links.input(index))
            Check.notEmpty(value, labels.links.input(index))
        },
        output: function (index, value) {
            Check.isString(value, labels.links.output(index))
            Check.notEmpty(value, labels.links.output(index))
        },
        factor: function (index, value) {
            Check.isString(value, labels.links.factor(index))
            Check.notEmpty(value, labels.links.factor(index))
            Check.isNumber(value, labels.links.factor(index))
            Check.notZero(value, labels.links.factor(index))
        },
        offset: function (index, value) {
            Check.isString(value, labels.links.offset(index))
            Check.notEmpty(value, labels.links.offset(index))
            Check.isNumber(value, labels.links.offset(index))
        },
    }
}

function validator({ setts, links }) {
    Check.hasProp(setts, "Setts", "period")
    checks.period(setts.period)
    Check.isArray(links, "Links")
    Check.nonZeroLength(links, "Links")
    links.forEach((link, index) => {
        Check.hasProp(link, labels.links.input(index), "input")
        checks.links.input(index, link.input)
        Check.hasProp(link, labels.links.factor(index), "factor")
        checks.links.factor(index, link.factor)
        Check.hasProp(link, labels.links.offset(index), "offset")
        checks.links.offset(index, link.offset)
        Check.hasProp(link, labels.links.output(index), "output")
        checks.links.output(index, link.output)
    })
}

export default {
    merge,
    config,
    setts,
    link,
    labels,
    hints,
    checks,
    validator,
}
