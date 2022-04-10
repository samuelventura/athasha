import React, { useState, useEffect } from 'react'

import ItemSearch from "./ItemSearch"
import ItemHeader from "./ItemHeader"
import ItemRows from "./ItemRows"
import ItemNew from "./ItemNew"

function ItemBrowser(props) {

    const [filter, setFilter] = useState("")
    const [sort, setSort] = useState("asc")

    function handleFilterChange(value) {
        setFilter(value)
    }

    function handleSortChange(value) {
        console.log("sort:", value)
        setSort(value)
    }

    function fetchItems() {

    }

    useEffect(() => {
        console.log("filter:", filter)
        fetchItems()
    }, [filter])

    function viewItems() {
        const f = filter.toLowerCase()
        const list = Object.values(props.state.files)
        const filtered = list.filter(file =>
            file.name.toLowerCase().includes(f))
        switch (sort) {
            case "asc":
                return filtered.sort((f1, f2) =>
                    f1.name.localeCompare(f2.name))
            case "desc":
                return filtered.sort((f1, f2) =>
                    f2.name.localeCompare(f1.name))
            default:
                return filtered
        }
    }

    return (
        <div className="ItemBrowser">
            <table className="ItemTablePanel">
                <thead>
                    <tr>
                        <th>
                            <ItemSearch
                                filter={filter}
                                onFilterChange={handleFilterChange}
                            />
                        </th>
                        <th>
                            <ItemNew dispatch={props.dispatch} />
                        </th>
                    </tr>
                </thead>
            </table>
            <table className="ItemTableData">
                <thead>
                    <tr>
                        <th>
                            <ItemHeader sort={sort}
                                onSortChange={handleSortChange} />
                        </th>
                    </tr>
                </thead>
                <ItemRows files={viewItems()}
                    dispatch={props.dispatch}
                    selected={props.state.selected} />
            </table>
        </div>
    )
}

export default ItemBrowser