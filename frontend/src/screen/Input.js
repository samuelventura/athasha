function getter(csetts, inputs) {
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
    const defval = csetts.defEnabled ? Number(csetts.defValue) : null
    const iid = csetts.input
    const value = iid && inputs ? inputs[iid] : null
    if (value === undefined) return defval
    if (value === null) return defval
    if (`${value}`.trim().length === 0) return defval
    if (!isFinite(value)) return defval
    return Number(value) * Number(csetts.inputFactor) + Number(csetts.inputOffset)
}

export default {
    getter
}
