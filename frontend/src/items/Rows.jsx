import { useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Log from "../tools/Log"
import Files from "../tools/Files"
import { useApp } from '../App'
import { DeleteItem } from "./Dialogs"
import { RenameItem } from "./Dialogs"
import Clipboard from "../tools/Clipboard"
import EditItem from "./Editor"
import Types from "./Types"
import Status from "./Status"

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

    function enabledClass(item) {
        return item.enabled ?
            "fw-normal" : "fst-italic"
    }

    function handleClick(e, action, item, args) {
        app.dispatch({ name: "select", args: item })
        switch (action) {
            case "edit": {
                // app.dispatch({ name: "target", args: { action, item } })
                window.open(`editor.html?id=${item.id}`, '_blank').focus();
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
                const clone = JSON.parse(JSON.stringify(item))
                clone.id = null
                clone.enabled = false
                app.send({ name: "create", args: clone })
                break
            }
            case "backup": {
                const clone = JSON.parse(JSON.stringify(item))
                Files.downloadJson([clone], item.name, Files.backupExtension);
                break
            }
            case "view": {
                const page = item.type.toLowerCase()
                window.open(`${page}.html?id=${item.id}`, '_blank').focus();
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
        function onDoubleClick(e) { e.stopPropagation() }
        const viewAction = (
            <Button variant="link" onClick={(e) => handleClick(e, 'view', item)}
                onDoubleClick={(e) => onDoubleClick(e)}
                disabled={!Types.withView.includes(item.type)}>View</Button>
        )
        return (<tr key={item.id} id={"item_" + item.id}
            onClick={() => handleSelect(item)}
            onDoubleClick={(e) => handleClick(e, "edit", item)}
            className={selectedClass(item) + ' align-middle'}>
            <td className={enabledClass(item)} title={item.id}>
                <img src={Types.icon(item.type)} width="20"
                    alt={item.type} className='me-2' />
                <span className='align-middle user-select-none'>{item.name}</span>
                <Status item={item} status={app.state.status[item.id]} />
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
                        <Dropdown.Item onClick={(e) => handleClick(e, 'copy-id', item)}>Copy ID</Dropdown.Item>
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

    return (
        <tbody>
            <EditItem />
            <DeleteItem />
            <RenameItem />
            {rows}
        </ tbody>
    )
}

export default Rows
