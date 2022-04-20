import { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import Environ from "../Environ"
import State from "./State"
import { useApp } from '../App';
import { DeleteItem } from "./Dialogs"
import { RenameItem } from "./Dialogs"
import { EditItem, SvgIcon } from "./Editor"

function Rows(props) {
    const app = useApp()
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

    function handleEdit(item, config) {
        setEditItem(noneItem)
        props.send({ name: "edit", args: { id: item.id, config } })
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
            default:
                Environ.log("Unknown action", action, item)
        }
    }

    function handleDoubleClick(item) {
        props.dispatch({ name: "select", args: item })
        setEditItem(item)
    }

    function Action({ onClick, label }) {
        function onDoubleClick(e) { e.stopPropagation() }
        return (<Button variant="link" onClick={onClick}
            onDoubleClick={(e) => onDoubleClick(e)}>{label}</Button>)
    }

    function statusTitle(item) {
        if (!item.enabled) {
            return "Disabled"
        }
        if (!item.status.type) {
            return "Enabled"
        }
        return item.status.msg
    }

    function statusMsg(item) {
        if (!item.enabled) {
            return "Disabled"
        }
        return "Enabled"
    }

    function statusBg(item) {
        if (!item.enabled) {
            return "secondary"
        }
        switch (item.status.type) {
            case "success": return "success"
            case "warn": return "warning"
            case "error": return "danger"
            default: return "primary"
        }
    }

    function StatusBadge({ item }) {
        return (
            <Badge pill bg={statusBg(item)} title={statusTitle(item)}
                className='ms-2 user-select-none'>
                {statusMsg(item)}
            </Badge>
        )
    }

    const rows = props.items.map(item =>
        <tr key={item.id} id={"item_" + item.id}
            onClick={() => handleSelect(item)}
            onDoubleClick={() => handleDoubleClick(item)}
            className={selectedClass(item)}>
            <td className={enabledClass(item)}>
                <img src={SvgIcon(item.type)} width="20"
                    alt={item.type} />
                <p className='ms-2 d-inline'>
                    {item.name}
                </p>
                <StatusBadge item={item} />
            </td>
            <td>
                <Action onClick={(e) => handleClick(e, 'edit', item)} label="Edit" />
                <Action onClick={(e) => handleClick(e, 'delete', item)} label="Delete" />
                <Action onClick={(e) => handleClick(e, 'rename', item)} label="Rename" />
                <Action onClick={(e) => handleClick(e, 'enable', item, true)} label="Enable" />
                <Action onClick={(e) => handleClick(e, 'enable', item, false)} label="Disable" />
            </td>
        </tr>
    )

    useEffect(() => {
        if (props.selected.id) {
            const id = `item_${props.selected.id}`
            const el = document.getElementById(id)
            if (el) el.scrollIntoViewIfNeeded();
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
            <EditItem item={editItem}
                accept={handleEdit} cancel={clearEdit} />
            <DeleteItem item={deleteItem}
                accept={handleDelete} cancel={clearDelete} />
            <RenameItem item={renameItem}
                accept={handleRename} cancel={clearRename} />
            {rows}
        </tbody>
    )
}

export default Rows
