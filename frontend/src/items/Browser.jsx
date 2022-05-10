import React, { useState } from 'react'
import Table from 'react-bootstrap/Table'
import Search from "./Search"
import Header from "./Header"
import Rows from "./Rows"
import New from "./New"
import { useApp } from '../App'

function Browser() {
    const app = useApp()
    const [filter, setFilter] = useState("")
    const [sort, setSort] = useState("asc")

    function handleFilterChange(value) {
        setFilter(value)
    }

    function handleSortChange(value) {
        setSort(value)
    }

    function viewItems() {
        const lower = filter.toLowerCase()
        const items = Object.values(app.state.items)
        const filtered = items.filter(item =>
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

    return (
        <>
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
                            <New />
                        </th>
                    </tr>
                </thead>
            </table>
            <Table className='items mt-1'>
                <thead>
                    <tr>
                        <th>
                            <Header sort={sort}
                                onSortChange={handleSortChange} />
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <Rows items={viewItems()} />
            </Table>
        </>
    )
}

export default Browser
