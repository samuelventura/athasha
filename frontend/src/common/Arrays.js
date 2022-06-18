function uniqueFilter(value, index, self) {
    return self.indexOf(value) === index
}

function unique(array) {
    return array.filter(uniqueFilter)
}

export default {
    unique,
    uniqueFilter,
}
