import React, { useState } from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Filter from '../tools/Filter'
import Log from "../tools/Log"
import Files from '../tools/Files'
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
        return Filter.apply(app.state.items, filter, sort)
    }

    function onAction(action) {
        switch (action) {
            case "open-views": {
                window.open("views.html", '_blank').focus();
                break
            }
            case "disable-all": {
                Object.values(app.state.items).forEach((item) => {
                    if (item.enabled) {
                        app.send({ name: "enable", args: { id: item.id, enabled: false } })
                    }
                })
                break
            }
            case "delete-all": {
                app.dispatch({ name: "target", args: { action } })
                break
            }
            case "backup-all": {
                const items = Object.values(app.state.items).map(item => {
                    return {
                        id: item.id,
                        name: item.name,
                        type: item.type,
                        enabled: item.enabled,
                        config: item.config,
                    }
                })
                Files.downloadJson(items, app.state.hostname, Files.backupExtension)
                break
            }
            case "restore": {
                Files.uploadJson(Files.backupExtension, function (data) {
                    app.send({ name: "restore", args: data })
                })
                break
            }
            default:
                Log.log("Unknown action", action)
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
                        <th>
                            <Dropdown as={ButtonGroup}>
                                <Button variant="none" className="pe-none">
                                    <span className="fw-bold">Actions</span>
                                </Button>
                                <Dropdown.Toggle split variant="link" />
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => onAction("open-views")}>Open Views</Dropdown.Item>
                                    <Dropdown.Item onClick={() => onAction("disable-all")}>Disable All</Dropdown.Item>
                                    <Dropdown.Item onClick={() => onAction("delete-all")}>Delete All</Dropdown.Item>
                                    <Dropdown.Item onClick={() => onAction("backup-all")}>Backup All</Dropdown.Item>
                                    <Dropdown.Item onClick={() => onAction("restore")}>Restore Backup</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </th>
                    </tr>
                </thead>
                <Rows items={viewItems()} />
            </Table >
        </>
    )
}

export default Browser
