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
import Keys from '../common/Keys'
import State from './State'
import { useApp } from '../App'
import { useEffect } from 'react'

const $type = State.$type
const $editor = State.$editor

function deleted() {
    const type = "error"
    const msg = "Deleted"
    //shows disabled otherwise
    const title = "Item has been deleted"
    const force = true
    return { type, msg, force, title }
}

function registerListener(callback) {
    const listener = (e) => {
        if (e.key === "s" && Keys.isCtrlKey(e)) {
            e.preventDefault();
            callback()
        }
    }
    document.addEventListener("keydown", listener, false)
    return () => document.removeEventListener("keydown", listener)
}

function EditItem() {
    const app = useApp()
    const init = app.state.init
    const item = app.state.item
    const found = !!app.state.items[$editor.id]
    const upgraded = app.state.upgrades[$editor.id]
    const [valid, setValid] = useState(false)
    //default to item.config for complete backup of default item
    const [config, setConfig] = useState(item.config)
    const [errors, setErrors] = useState(Schema.errors.get())
    const [captured, setCaptured] = useState({})
    const status = found ? app.state.status : deleted()
    const hashed = State.hash(item.config)
    const dirty = hashed !== State.hash(config)
    const enabled = init && found
    useEffect(() => {
        document.title = `Athasha ${item.type} Editor - ${item.name}`
    }, [item.name])
    useEffect(() => {
        return registerListener(() => onButton("save"))
    }, [config])
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
    function itemEditor() {
        const state = {
            globals: {
                captured, setCaptured,
                dispatch: (msg) => app.dispatch(msg),
                targeted: app.state.targeted,
                inputs: app.state.inputs.filter(p => !p.point.string),
                outputs: app.state.outputs.filter(p => !p.point.string),
                istrings: app.state.inputs.filter(p => !!p.point.string),
                ostrings: app.state.outputs.filter(p => !!p.point.string)
            }
        }
        state.id = item.id
        state.hash = hashed
        state.config = Clone.deep(item.config)
        state.setter = (next) => {
            const cloned = Clone.deep(next)
            const merged = $type.merge(cloned)
            const errors = Schema.errors.get()
            setValid(errors.total.length === 0)
            setErrors(errors)
            setConfig(merged)
        }
        return Editors.get(item.type)(state)
    }
    return (
        <Modal show={init} onHide={() => onButton("close")} backdrop="static"
            centered dialogClassName="EditorModal" fullscreen keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>
                    <img className="align-middle me-2" src={Icon.get(item.type)} width="24" alt={item.type} />
                    <Item.Name item={item} />
                    <Item.Status item={item} status={status} />
                    <Item.Upgraded upgraded={upgraded} />
                    <Item.Invalid errors={errors} />
                    <Item.Dirty dirty={dirty} />
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
                <Button variant="secondary" onClick={() => onButton("backup")}
                    title="Backup current state">
                    Backup
                </Button>
                <Button variant="secondary" onClick={() => onButton("view")}
                    disabled={!enabled || !Type.views.includes(item.type)}
                    title="Launch item viewer">
                    View
                </Button>
                <Button variant="secondary" onClick={() => onButton("rename")}
                    disabled={!enabled} title="Rename this item">
                    Rename
                </Button>
                <Button variant="secondary" onClick={() => onButton("disable")}
                    disabled={!enabled} title="Disable this item">
                    Disable
                </Button>
                <Button variant={valid ? "primary" : "secondary"} onClick={() => onButton("save")}
                    disabled={!enabled} title="Save changes but do not apply them yet">
                    Save
                </Button>
                <Button variant={valid ? "primary" : "secondary"} onClick={() => onButton("save-enable")}
                    disabled={!enabled} title="Save and apply changes by re-enable the item">
                    Save and Enable
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default EditItem
