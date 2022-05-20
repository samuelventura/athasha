import React, { useState } from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Filter from '../tools/Filter'
import Search from "./Search"
import Header from "./Header"
import Rows from "./Rows"
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
        return Filter.apply(app.state.items, filter, sort)
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
                    </tr>
                </thead>
            </table>
            <Table className='items mt-1' hover>
                <thead>
                    <tr>
                        <th>
                            <Header sort={sort}
                                onSortChange={handleSortChange} />
                        </th>
                        <th>
                            <Button variant="none" disabled>
                                <span className="fw-bold">Actions</span>
                            </Button>
                        </th>
                    </tr>
                </thead>
                <Rows items={viewItems()} />
            </Table>
        </>
    )
}

export default Browser
