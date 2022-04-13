import { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Environ from "../Environ"
import State from "./State"
import { useApp } from '../App';
import { DeleteItem } from "./Dialogs"
import { RenameItem } from "./Dialogs"
import { EditItem } from "./Editor"

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
        e.preventDefault() //avoid double click
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

    const rows = props.items.map(item =>
        <tr key={item.id} id={"item_" + item.id}
            onClick={() => handleSelect(item)}
            onDoubleClick={() => setEditItem(item)}
            className={selectedClass(item)}>
            <td>
                <p className={enabledClass(item)}>{item.id} {item.name}</p>
            </td>
            <td>
                <Button variant="link" onClick={(e) => handleClick(e, 'edit', item)}>Edit</Button>
                <Button variant="link" onClick={(e) => handleClick(e, 'delete', item)}>Delete</Button>
                <Button variant="link" onClick={(e) => handleClick(e, 'rename', item)}>Rename</Button>
                <Button variant="link" onClick={(e) => handleClick(e, 'enable', item, true)}>Enable</Button>
                <Button variant="link" onClick={(e) => handleClick(e, 'enable', item, false)}>Disable</Button>
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
