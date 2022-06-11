import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Schema from '../common/Schema'
import Item from "../common/Item"
import Editors from './Editors'
import Files from '../tools/Files'
import Clone from '../tools/Clone'
import Type from '../common/Type'
import Icon from '../common/Icon'
import { useApp } from '../App'

function EditItem() {
    const app = useApp()
    const type = app.state.type
    const item = app.state.item
    const status = app.state.status
    const upgraded = app.state.upgraded
    function isActive() { return !!item.id }
    const [valid, setValid] = useState(false)
    const [disabled, setDisabled] = useState(true)
    const [errors, setErrors] = useState(Schema.errors.get())
    const [config, setConfig] = useState({})
    const [captured, setCaptured] = useState({})
    function onButton(action) {
        const id = item.id
        switch (action) {
            case "close":
                //ff Scripts may not close windows that were not opened by script.
                //ff fails when lauching from a direct copy/pasted link
                //ff works when launched from a double click on item row
                window.close()
                break
            case "view": {
                const page = item.type.toLowerCase()
                window.open(`${page}.html?id=${id}`, '_blank').focus()
                break
            }
            case "save":
                app.send({ name: "edit", args: { id, config } })
                break
            case "disable":
                app.send({ name: "enable", args: { id, enabled: false } })
                break
            case "save-enable":
                app.send({ name: "edit", args: { id, config } })
                app.send({ name: "enable", args: { id, enabled: true } })
                break
            case "backup":
                Files.downloadJson([{ ...item, config }], item.name, Files.backupExtension)
                break
            case "rename":
                app.dispatch({ name: "target", args: { action, item } })
                break
        }
    }
    function cloned() {
        return Clone.deep(item.config)
    }
    function itemEditor() {
        const state = {
            globals: {
                captured, setCaptured,
                inputs: app.state.inputs,
                outputs: app.state.outputs
            }
        }
        state.config = isActive() ? cloned() : Type.config(type)
        state.id = isActive() ? item.id : ""
        state.setter = isActive() ? (next) => {
            Type.merge(type, Clone.deep(next))
            const errors = Schema.errors.get()
            setValid(errors.total.length === 0)
            setDisabled(false)
            setErrors(errors)
            setConfig(next)
        } : () => { }
        return Editors.get(type)(state)
    }
    function itemIcon() {
        return isActive() ? <img className="align-middle me-2" src={Icon.get(item.type)} width="24"
            alt={item.type} /> : null
    }
    return (
        <Modal show={isActive()} onHide={() => onButton("close")} backdrop="static"
            centered dialogClassName="EditorModal" fullscreen keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {itemIcon()}
                    <Item.Name item={item} />
                    <Item.Status item={item} status={status} />
                    <Item.Upgraded upgraded={upgraded} />
                    <Item.Invalid errors={errors} />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {itemEditor()}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onButton("close")}
                    title="Close editor without saving changes">
                    Close
                </Button>
                <Button variant="secondary" onClick={() => onButton("view")}
                    disabled={!Type.views.includes(item.type)}
                    title="Launch item viewer">
                    View
                </Button>
                <Button variant="secondary" onClick={() => onButton("backup")}
                    title="Backup current state">
                    Backup
                </Button>
                <Button variant="secondary" onClick={() => onButton("rename")}
                    title="Rename this item">
                    Rename
                </Button>
                <Button variant="secondary" onClick={() => onButton("disable")}
                    title="Disable this item">
                    Disable
                </Button>
                <Button variant={valid ? "primary" : "secondary"} onClick={() => onButton("save")}
                    disabled={disabled} title="Save changes but do not apply them yet">
                    Save
                </Button>
                <Button variant={valid ? "primary" : "secondary"} onClick={() => onButton("save-enable")}
                    disabled={disabled} title="Save and apply changes by re-enable the item">
                    Save and Enable
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default EditItem
