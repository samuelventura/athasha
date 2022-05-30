import { useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Log from "../tools/Log"
import Files from "../tools/Files"
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
        function onDoubleClick(e) { e.stopPropagation() }
        const viewAction = (
            <Button variant="link" onClick={(e) => onAction('view', item)}
                onDoubleClick={(e) => onDoubleClick(e)}
                disabled={!Types.withView.includes(item.type)}>View</Button>
        )
        return (<tr key={item.id} id={"item_" + item.id}
            onClick={() => handleSelect(item)}
            onDoubleClick={(e) => onAction("edit", item)}
            className={selectedClass(item) + ' align-middle'}>
            <Item.Td item={item} status={app.state.status[item.id]} />
            <td>
                {viewAction}
                <Dropdown as={ButtonGroup} onDoubleClick={(e) => onDoubleClick(e)}>
                    <Button variant="link" onClick={(e) => onAction('edit', item)}>
                        Edit
                    </Button>
                    <Dropdown.Toggle split variant="link" />
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={(e) => onAction('rename', item)}>Rename</Dropdown.Item>
                        <Dropdown.Item onClick={(e) => onAction('enable', item, true)}>Enable</Dropdown.Item>
                        <Dropdown.Item onClick={(e) => onAction('enable', item, false)}>Disable</Dropdown.Item>
                        <Dropdown.Item onClick={(e) => onAction('delete', item)}>Delete</Dropdown.Item>
                        <Dropdown.Item onClick={(e) => onAction('clone', item)}>Clone</Dropdown.Item>
                        <Dropdown.Item onClick={(e) => onAction('backup', item)}>Backup</Dropdown.Item>
                        <Dropdown.Item onClick={(e) => onAction('copy-id', item)}>Copy ID</Dropdown.Item>
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

    useEffect(() => {
        const created = app.state.created
        if (created.id) {
            //open a new tab stop the modal hiding transition a long
            //delay is required to really launch when modal is closed
            app.dispatch({ name: "created", args: {} })
            setTimeout(() => { onAction("edit", created) }, 200)
        }
    }, [app.state.created.id])

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
