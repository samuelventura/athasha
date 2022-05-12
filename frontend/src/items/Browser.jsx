import React, { useState } from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
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

    function onDisable() {
        Object.values(app.state.items).forEach((item) => {
            if (item.enabled) {
                app.send({ name: "enable", args: { id: item.id, enabled: false } })
            }
        })
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
                        <th>
                            <Dropdown as={ButtonGroup}>
                                <Button variant="none" disabled>
                                    <span class="fw-bold">Actions</span>
                                </Button>
                                <Dropdown.Toggle split variant="link" />
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={onDisable}>Disable All</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </th>
                    </tr>
                </thead>
                <Rows items={viewItems()} />
            </Table>
        </>
    )
}

export default Browser
