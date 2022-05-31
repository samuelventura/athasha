import React, { useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Log from "../tools/Log"
import { useApp } from '../App'
import { DeleteItem } from "./Dialogs"
import { RenameItem } from "./Dialogs"
import { DeleteAllItems } from "./Dialogs"
import Clipboard from "../tools/Clipboard"
import Types from "../common/Types"
import Item from "../common/Item"

function Rows(props) {
    const app = useApp()

    function isSelected(item) {
        return item.id === app.state.selected.id
    }

    function handleSelect(item) {
        app.dispatch({ name: "select", args: item })
    }

    function selectedClass(item) {
        return isSelected(item) ?
            "table-active" : ""
    }

    function onAction(action, item, args) {
        app.dispatch({ name: "select", args: item })
        switch (action) {
            case "edit": {
                Item.onEdit(item)
                break
            }
            case "delete": {
                app.dispatch({ name: "target", args: { action, item } })
                break
            }
            case "rename": {
                app.dispatch({ name: "target", args: { action, item } })
                break
            }
            case "enable": {
                app.send({ name: "enable", args: { id: item.id, enabled: args } })
                break
            }
            case "clone": {
                app.send({ name: "clone", args: { id: item.id } })
                break
            }
            case "backup": {
                app.send({ name: "backup-one", args: { id: item.id } })
                break
            }
            case "view": {
                Item.onView(item)
                break
            }
            case "copy-id": {
                Clipboard.copyText(item.id)
                break
            }
            default:
                Log.log("Unknown action", action, item)
        }
    }

    const rows = props.items.map(item => {
        const status = app.state.status[item.id]
        const upgraded = app.state.upgrades[item.id]
        function onDoubleClick(e) { e.stopPropagation() }
        const viewAction = (
            <Button variant="link" onClick={() => onAction('view', item)}
                onDoubleClick={(e) => onDoubleClick(e)}
                disabled={!Types.withView.includes(item.type)}>View</Button>
        )
        return (<tr key={item.id} id={"item_" + item.id}
            onClick={() => handleSelect(item)}
            onDoubleClick={() => onAction("edit", item)}
            className={selectedClass(item) + ' align-middle'}>
            <Item.Td item={item} status={status} upgraded={upgraded} />
            <td>
                {viewAction}
                <Dropdown as={ButtonGroup} onDoubleClick={(e) => onDoubleClick(e)}>
                    <Button variant="link" onClick={() => onAction('edit', item)}>
                        Edit
                    </Button>
                    <Dropdown.Toggle split variant="link" />
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => onAction('rename', item)}>Rename</Dropdown.Item>
                        <Dropdown.Item onClick={() => onAction('enable', item, true)}>Enable</Dropdown.Item>
                        <Dropdown.Item onClick={() => onAction('enable', item, false)}>Disable</Dropdown.Item>
                        <Dropdown.Item onClick={() => onAction('delete', item)}>Delete</Dropdown.Item>
                        <Dropdown.Item onClick={() => onAction('clone', item)}>Clone</Dropdown.Item>
                        <Dropdown.Item onClick={() => onAction('backup', item)}>Backup</Dropdown.Item>
                        <Dropdown.Item onClick={() => onAction('copy-id', item)}>Copy ID</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </td>
        </tr>)
    })

    useEffect(() => {
        const id = `item_${app.state.selected.id}`
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoViewIfNeeded ?
                el.scrollIntoViewIfNeeded() :
                el.scrollIntoView()
        }
    }, [app.state.selected.id])

    return (
        <tbody>
            <DeleteItem />
            <RenameItem />
            <DeleteAllItems />
            {rows}
        </ tbody>
    )
}

export default Rows
