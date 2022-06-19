function getter(csetts, inputs) {
    const input = csetts.input
    const value = input && inputs ? inputs[input] : null

    if (csetts.istring) {
        const ivalue = csetts.isvalued ? csetts.isvalue : null
        if (value === undefined) return ivalue
        if (value === null) return ivalue
        return `${value}`
    }

    //Number("") -> 0
    //Number(" ") -> 0
    //Number("-") -> NaN
    //Number(null) -> 0
    //Number([]) -> 0
    //Number({}) -> NaN
    //Number(false) -> 0
    //Number(true) -> 1
    //Number("false") -> NaN
    //Number("true") -> NaN
    //Number(undefined) -> NaN
    const ivalue = csetts.ivalued ? Number(csetts.ivalue) : null
    if (value === undefined) return ivalue
    if (value === null) return ivalue
    if (`${value}`.trim().length === 0) return ivalue
    if (!isFinite(value)) return ivalue
    return Number(value) * Number(csetts.inputFactor) + Number(csetts.inputOffset)
}

function scaler(csetts, value) {
    return Number(value) * Number(csetts.inputFactor) + Number(csetts.inputOffset)
}

export default {
    getter,
    scaler,
}
