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

    const bodyStyle = {
        height: 'calc(100vh - 10em)',
        minHeight: 'calc(100vh - 10em)',
        maxHeight: 'calc(100vh - 10em)',
        overflowY: 'auto',
        overflowX: 'hidden',
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
                            <New send={props.send} />
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
                <Rows items={viewItems()}
                    send={props.send}
                    dispatch={props.dispatch}
                    selected={props.state.selected} />
            </Table>
        </>
    )
}

export default Browser