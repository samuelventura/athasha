import { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import Environ from "../Environ"
import State from "./State"
import { useApp } from '../App'
import { DeleteItem } from "./Dialogs"
import { RenameItem } from "./Dialogs"
import { ItemEditor, ItemIcon } from "./Editor"

function Rows(props) {
    const app = useApp()
    const state = app.state
    const noneItem = State.initial().selected
    const [deleteItem, setDeleteItem] = useState(noneItem)
    const [renameItem, setRenameItem] = useState(noneItem)
    const [editItem, setEditItem] = useState(noneItem)

    function isSelected(item) {
        return item.id === props.selected.id
    }

    function handleSelect(item) {
        const selected = isSelected(item) ? noneItem : item
        props.dispatch({ name: "select", args: selected })
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
        props.send({ name: "delete", args: { id: item.id } })
    }

    function clearDelete() {
        setDeleteItem(noneItem)
    }

    function handleRename(item, name) {
        setRenameItem(noneItem)
        props.send({ name: "rename", args: { id: item.id, name } })
    }

    function clearRename() {
        setRenameItem(noneItem)
    }

    function handleEdit(item, config, forView) {
        if (!forView) setEditItem(noneItem)
        props.send({ name: "edit", args: { id: item.id, config } })
        if (forView) props.send({ name: "enable", args: { id: item.id, enabled: true } })
    }

    function clearEdit() {
        setEditItem(noneItem)
    }

    function handleClick(e, action, item, args) {
        e.stopPropagation() //avoid unselection
        props.dispatch({ name: "select", args: item })
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
                props.send({ name: "enable", args: { id: item.id, enabled: args } })
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
        props.dispatch({ name: "select", args: item })
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
        const status = state.status[item.id]
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
        const viewAction = itemsWithView.includes(item.type) ? (
            <Button variant="link" onClick={(e) => handleClick(e, 'view', item)}
                onDoubleClick={(e) => onDoubleClick(e)}>View</Button>
        ) : null
        return (<tr key={item.id} id={"item_" + item.id}
            onClick={() => handleSelect(item)}
            onDoubleClick={() => handleDoubleClick(item)}
            className={selectedClass(item) + ' align-middle'}
            title={item.id}>
            <td className={enabledClass(item)}>
                <img src={ItemIcon(item.type)} width="20"
                    alt={item.type} className='me-2' />
                <span className='align-middle'>{item.name}</span>
                <StatusBadge item={item} />
            </td>
            <td>
                <Button variant="link" onClick={(e) => handleClick(e, 'edit', item)}
                    onDoubleClick={(e) => onDoubleClick(e)}>Edit</Button>
                <Button variant="link" onClick={(e) => handleClick(e, 'delete', item)}
                    onDoubleClick={(e) => onDoubleClick(e)}>Delete</Button>
                <Button variant="link" onClick={(e) => handleClick(e, 'rename', item)}
                    onDoubleClick={(e) => onDoubleClick(e)}>Rename</Button>
                <Button variant="link" onClick={(e) => handleClick(e, 'enable', item, true)}
                    onDoubleClick={(e) => onDoubleClick(e)}>Enable</Button>
                <Button variant="link" onClick={(e) => handleClick(e, 'enable', item, false)}
                    onDoubleClick={(e) => onDoubleClick(e)}>Disable</Button>
                {viewAction}
            </td>
        </tr>)
    })

    useEffect(() => {
        if (props.selected.id) {
            const id = `item_${props.selected.id}`
            const el = document.getElementById(id)
            if (el) {
                el.scrollIntoViewIfNeeded ?
                    el.scrollIntoViewIfNeeded() :
                    el.scrollIntoView()
            }
        }
    }, [props])

    useEffect(() => {
        if (!app.logged) {
            const noneItem = State.initial().selected
            setDeleteItem(noneItem)
            setRenameItem(noneItem)
            setEditItem(noneItem)
        }
    }, [app.logged])

    return (
        <tbody>
            <ItemEditor item={editItem} logged={app.logged}
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
