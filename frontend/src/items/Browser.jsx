import React from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Log from "../tools/Log"
import Files from '../tools/Files'
import Search from "../common/Search"
import Header from "../common/Header"
import useItems from '../common/Items'
import { useApp } from '../App'
import Rows from "./Rows"
import New from "./New"

function Browser() {
    const app = useApp()
    const items = useItems()

    function onAction(action) {
        switch (action) {
            case "open-views": {
                window.open("views.html", '_blank').focus()
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
                const name = `${app.state.hostname}`
                app.send({ name: "backup-all", args: { name } })
                break
            }
            case "backup-filtered": {
                const name = `${app.state.hostname}-${items.filter}`
                const list = items.list().map(item => item.id)
                app.send({ name: "backup-list", args: { name, list } })
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
                                filter={items.filter}
                                setFilter={items.setFilter}
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
                            <Header sort={items.sort}
                                setSort={items.setSort} />
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
                                    <Dropdown.Item onClick={() => onAction("backup-filtered")}>Backup Filtered</Dropdown.Item>
                                    <Dropdown.Item onClick={() => onAction("restore")}>Restore Backup</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </th>
                    </tr>
                </thead>
                <Rows items={items.list()} />
            </Table >
        </>
    )
}

export default Browser
