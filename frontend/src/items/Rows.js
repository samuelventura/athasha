import { useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Environ from "../Environ"

function Rows(props) {

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

    function handleClick(e, action, item, args) {
        e.stopPropagation() //avoid unselection
        props.dispatch({ name: "select", args: item })
        switch (action) {
            case "edit": {
                //window.open(env.href(`/edit/${item.id}`), '_blank')
                break
            }
            case "delete": {
                const accept = window.confirm(`Delete item '${item.name}'?`)
                if (!accept) return
                props.send({ name: "delete", args: { id: item.id } })
                break
            }
            case "rename": {
                const name = window.prompt(`Rename item '${item.name}'`, item.name)
                if (name === null) return
                if (name.trim().length === 0) return
                props.send({ name: "rename", args: { id: item.id, name } })
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

    return (
        <tbody>
            {rows}
        </tbody>
    )
}

export default Rows