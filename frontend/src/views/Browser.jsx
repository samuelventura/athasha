import React from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Header from "../common/Header"
import Search from "../common/Search"
import useItems from '../common/Items'
import Rows from "./Rows"

function Browser() {
    const items = useItems()

    return (
        <>
            <table>
                <thead>
                    <tr>
                        <th>
                            <Search
                                filter={items.filter}
                                setFilter={items.setFilter}
                            />
                        </th>
                    </tr>
                </thead>
            </table>
            <Table className='items mt-1' hover>
                <thead>
                    <tr>
                        <th>
                            <Header sort={items.sort}
                                setSort={items.setSort} />
                        </th>
                        <th>
                            <Button variant="none" className="pe-none">
                                <span className="fw-bold">Actions</span>
                            </Button>
                        </th>
                    </tr>
                </thead>
                <Rows items={items.list()} />
            </Table>
        </>
    )
}

export default Browser
