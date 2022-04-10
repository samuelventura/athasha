import React, { useState } from 'react'

import ItemSearch from "./ItemSearch"
import ItemHeader from "./ItemHeader"
import ItemRows from "./ItemRows"
import ItemNew from "./ItemNew"

function ItemBrowser(props) {

    const [filter, setFilter] = useState("")
    const [sort, setSort] = useState("asc")

    function handleFilterChange(value) {
        console.log("filter:", value)
        //fetch data here, even the initial data
        //because ItemSearch triggers thie event
        //even on initial rendering
        setFilter(value)
    }

    function handleSortChange(value) {
        console.log("sort:", value)
        setSort(value)
    }

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
            <ItemNew dispatch={props.dispatch} />
            <table className="ItemTable">
                <thead>
                    <tr>
                        <th className="ItemTop">
                            <ItemSearch
                                filter={filter}
                                onFilterChange={handleFilterChange}
                            />
                        </th>
                    </tr>
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