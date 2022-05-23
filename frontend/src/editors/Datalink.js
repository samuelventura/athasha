import Check from './Check'

function config() {
    return {
        setts: setts(),
        links: [link()],
    }
}

function setts() {
    return {
        period: "100",
    }
}

function link() {
    return {
        input: "",
        output: "",
    }
}

const labels = {
    period: "Period (ms)",
    link: {
        input: "Input Name",
        output: "Output Name",
    },
    links: {
        input: (i) => `Input ${i + 1}`,
        output: (i) => `Output ${i + 1}`,
    }
}

const hints = {
    period: "Non empty integer period > 0",
    links: {
        input: (i) => "Select the input name from the list",
        output: (i) => "Select the output name from the list",
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
        Check.hasProp(link, labels.links.output(index), "output")
        checks.links.output(index, link.output)
    })
}

export default {
    config,
    setts,
    link,
    labels,
    hints,
    checks,
    validator,
}
