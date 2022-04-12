import React, { useState } from 'react'
import Table from 'react-bootstrap/Table'
import Search from "./Search"
import Header from "./Header"
import Rows from "./Rows"
import New from "./New"

function Browser(props) {

    const [filter, setFilter] = useState("")
    const [sort, setSort] = useState("asc")

    function handleFilterChange(value) {
        setFilter(value)
    }

    function handleSortChange(value) {
        setSort(value)
    }

    function viewItems() {
        const f = filter.toLowerCase()
        const list = Object.values(props.state.items)
        const filtered = list.filter(item =>
            item.name.toLowerCase().includes(f))
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
        <div>
            <table>
                <thead>
                    <tr>
                        <th>
                            <Search
                                filter={filter}
                                onFilterChange={handleFilterChange}
                            />
                        </th>
                        <th>
                            <New send={props.send} />
                        </th>
                    </tr>
                </thead>
            </table>
            <Table className='mt-1' hover>
                <thead>
                    <tr>
                        <th>
                            <Header sort={sort}
                                onSortChange={handleSortChange} />
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <Rows items={viewItems()}
                    dispatch={props.dispatch}
                    selected={props.state.selected} />
            </Table>
        </div>
    )
}

export default Browser
