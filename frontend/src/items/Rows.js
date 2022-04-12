import { useEffect } from 'react'
import Button from 'react-bootstrap/Button'

function Rows(props) {

    function handleDelete(item) {
        const accept = window.confirm(`Delete item '${item.name}'?`)
        if (!accept) return
        props.dispatch({ name: "delete", args: { id: item.id } })
    }

    function handleEdit(item) {
        //window.open(env.href(`/edit/${item.id}`), '_blank')
    }

    function handleRename(item) {
        const name = window.prompt(`Rename item '${item.name}'`, item.name)
        if (name === null) return
        if (name.trim().length === 0) return
        props.dispatch({ name: "rename", args: { id: item.id, name } })
    }

    function handleEnable(item, enabled) {
        props.dispatch({ name: "enable", args: { id: item.id, enabled } })
    }

    function isSelected(item) {
        return item.id === props.selected.id
    }

    function handleSelect(item) {
        const selected = isSelected(item) ? {} : item
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

    const rows = props.items.map(item =>
        <tr key={item.id} id={"item_" + item.id}
            onClick={() => handleSelect(item)}
            className={selectedClass(item)}>
            <td>
                <p className={enabledClass(item)}>{item.id} {item.name}</p>
            </td>
            <td>
                <Button variant="link" onClick={() => handleEdit(item)}>Edit</Button>
                <Button variant="link" onClick={() => handleDelete(item)}>Delete</Button>
                <Button variant="link" onClick={() => handleRename(item)}>Rename</Button>
                <Button variant="link" onClick={() => handleEnable(item, true)}>Enable</Button>
                <Button variant="link" onClick={() => handleEnable(item, false)}>Disable</Button>
            </td>
        </tr>
    )

    useEffect(() => {
        if (props.selected.id) {
            const id = `item_${props.selected.id}`
            const el = document.getElementById(id)
            el.scrollIntoViewIfNeeded();
        }
    }, [props.selected])

    return (
        <tbody>
            {rows}
        </tbody>
    )
}

export default Rows