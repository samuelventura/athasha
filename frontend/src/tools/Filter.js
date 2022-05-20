
function apply(items, filter, sort) {
    const lower = filter.toLowerCase()
    const list = Object.values(items)
    const filtered = list.filter(item =>
        item.name.toLowerCase().includes(lower))
    switch (sort) {
        case "asc":
            return filtered.sort((f1, f2) => {
                let r = f1.name.localeCompare(f2.name)
                if (!r) r = f1.id - f2.id
                return r
            })
        case "desc":
            return filtered.sort((f2, f1) => {
                let r = f1.name.localeCompare(f2.name)
                if (!r) r = f1.id - f2.id
                return r
            })
        default:
            return filtered
    }
}

const Filter = { apply }

export default Filter
