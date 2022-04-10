import React, { useState } from 'react'

import FileSearch from "./FileSearch"
import FileHeader from "./FileHeader"
import FileRows from "./FileRows"
import FileNew from "./FileNew"

function FileBrowser(props) {

    const [filter, setFilter] = useState("")
    const [sort, setSort] = useState("asc")

    function handleFilterChange(value) {
        setFilter(value)
    }

    function handleSortChange(value) {
        setSort(value)
    }

    function viewFiles() {
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
        <div className="FileBrowser">
            <FileNew dispatch={props.dispatch} />
            <table className="FileTable">
                <thead>
                    <tr>
                        <th className="FileTop">
                            <FileSearch
                                filter={filter}
                                onFilterChange={handleFilterChange}
                            />
                        </th>
                    </tr>
                    <tr>
                        <th>
                            <FileHeader sort={sort}
                                onSortChange={handleSortChange} />
                        </th>
                    </tr>
                </thead>
                <FileRows files={viewFiles()}
                    dispatch={props.dispatch}
                    selected={props.state.selected} />
            </table>
        </div>
    )
}

export default FileBrowser