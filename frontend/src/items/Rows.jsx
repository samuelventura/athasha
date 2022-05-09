import { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Environ from "../Environ"
import State from "./State"
import Files from "./Files"
import { useApp } from '../App'
import { DeleteItem } from "./Dialogs"
import { RenameItem } from "./Dialogs"
import Editor from "./Editor"
import Types from "./Types"

function Rows(props) {
    const app = useApp()
    const noneItem = State.initial().selected
    const [deleteItem, setDeleteItem] = useState(noneItem)
    const [renameItem, setRenameItem] = useState(noneItem)
    const [editItem, setEditItem] = useState(noneItem)

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

    function enabledClass(item) {
        return item.enabled ?
            "fw-normal" : "fst-italic"
    }

    function handleDelete(item) {
        setDeleteItem(noneItem)
        app.send({ name: "delete", args: { id: item.id } })
    }

    function clearDelete() {
        setDeleteItem(noneItem)
    }

    function handleRename(item, name) {
        setRenameItem(noneItem)
        app.send({ name: "rename", args: { id: item.id, name } })
    }

    function clearRename() {
        setRenameItem(noneItem)
    }

    function handleEdit(id, config, action) {
        switch (action) {
            case "save":
                app.send({ name: "edit", args: { id, config } })
                break
            case "save-close":
                app.send({ name: "edit", args: { id, config } })
                setEditItem(noneItem)
                break
            case "save-update":
                app.send({ name: "edit", args: { id, config } })
                app.send({ name: "enable", args: { id, enabled: true } })
                break
        }
    }

    function clearEdit() {
        setEditItem(noneItem)
    }

    function handleClick(e, action, item, args) {
        app.dispatch({ name: "select", args: item })
        switch (action) {
            case "edit": {
                setEditItem(item)
                break
            }
            case "delete": {
                setDeleteItem(item)
                break
            }
            case "rename": {
                setRenameItem(item)
                break
            }
            case "enable": {
                app.send({ name: "enable", args: { id: item.id, enabled: args } })
                break
            }
            case "clone": {
                const clone = JSON.parse(JSON.stringify(item))
                clone.id = null
                clone.enabled = false
                app.send({ name: "create", args: clone })
                break
            }
            case "backup": {
                const clone = JSON.parse(JSON.stringify(item))
                Files.download([clone], Files.backupExtension);
                break
            }
            case "view": {
                const page = item.type.toLowerCase()
                window.open(`${page}.html?id=${item.id}`, '_blank').focus();
                break
            }
            default:
                Environ.log("Unknown action", action, item)
        }
    }

    function handleDoubleClick(item) {
        app.dispatch({ name: "select", args: item })
        setEditItem(item)
    }

    function statusTitle(item, status) {
        if (!item.enabled) {
            return "Disabled"
        }
        if (!status.type) {
            return "Enabled"
        }
        return status.msg
    }

    function statusMsg(item, status) {
        if (!item.enabled) {
            return "Disabled"
        }
        return "Enabled"
    }

    function statusBg(item, status) {
        if (!item.enabled) {
            return "secondary"
        }
        switch (status.type) {
            case "success": return "success"
            case "warn": return "warning"
            case "error": return "danger"
            default: return "primary"
        }
    }

    function StatusBadge({ item }) {
        const status = app.state.status[item.id]
        return (
            <Badge pill bg={statusBg(item, status)} title={statusTitle(item, status)}
                className='ms-2 user-select-none'>
                {statusMsg(item, status)}
            </Badge>
        )
    }
    const itemsWithView = ["Screen", "Dataplot"]
    const rows = props.items.map(item => {
        function onDoubleClick(e) { e.stopPropagation() }
        const viewAction = (
            <Button variant="link" onClick={(e) => handleClick(e, 'view', item)}
                onDoubleClick={(e) => onDoubleClick(e)}
                disabled={!itemsWithView.includes(item.type)}>View</Button>
        )
        return (<tr key={item.id} id={"item_" + item.id}
            onClick={() => handleSelect(item)}
            onDoubleClick={() => handleDoubleClick(item)}
            className={selectedClass(item) + ' align-middle'}
            title={item.id}>
            <td className={enabledClass(item)}>
                <img src={Types.icon(item.type)} width="20"
                    alt={item.type} className='me-2' />
                <span className='align-middle'>{item.name}</span>
                <StatusBadge item={item} />
            </td>
            <td>
                {viewAction}
                <Dropdown as={ButtonGroup} onDoubleClick={(e) => onDoubleClick(e)}>
                    <Button variant="link" onClick={(e) => handleClick(e, 'edit', item)}>
                        Edit
                    </Button>
                    <Dropdown.Toggle split variant="link" />
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={(e) => handleClick(e, 'rename', item)}>Rename</Dropdown.Item>
                        <Dropdown.Item onClick={(e) => handleClick(e, 'enable', item, true)}>Enable</Dropdown.Item>
                        <Dropdown.Item onClick={(e) => handleClick(e, 'enable', item, false)}>Disable</Dropdown.Item>
                        <Dropdown.Item onClick={(e) => handleClick(e, 'delete', item)}>Delete</Dropdown.Item>
                        <Dropdown.Item onClick={(e) => handleClick(e, 'clone', item)}>Clone</Dropdown.Item>
                        <Dropdown.Item onClick={(e) => handleClick(e, 'backup', item)}>Backup</Dropdown.Item>
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
    }, [app.state.selected])

    useEffect(() => {
        const noneItem = State.initial().selected
        setDeleteItem(noneItem)
        setRenameItem(noneItem)
        setEditItem(noneItem)
    }, [app.logged])

    return (
        <tbody>
            <Editor item={editItem}
                accept={handleEdit} cancel={clearEdit} />
            <DeleteItem item={deleteItem}
                accept={handleDelete} cancel={clearDelete} />
            <RenameItem item={renameItem}
                accept={handleRename} cancel={clearRename} />
            {rows}
        </ tbody>
    )
}

export default Rows
