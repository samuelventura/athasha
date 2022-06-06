import { useState } from 'react'
import Filter from '../common/Filter'
import { useApp } from '../App'

function useItems() {
    const app = useApp()
    const [filter, setFilter] = useState("")
    const [sort, setSort] = useState("asc")

    function list() {
        return Filter.apply(app.state.items, filter, sort)
    }

    return {
        sort,
        filter,
        setFilter,
        setSort,
        list,
    }
}

export default useItems
