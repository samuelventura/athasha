import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Types from '../common/Types'
import Item from "../common/Item"
import Editors from './Editors'
import { useApp } from '../App'

function EditItem() {
    const app = useApp()
    const type = app.state.type
    const item = app.state.item
    const status = app.state.status
    function isActive() { return !!item.id }
    const [valid, setValid] = useState(false)
    const [config, setConfig] = useState({})
    const [captured, setCaptured] = useState({})
    function onButton(action) {
        const id = item.id
        switch (action) {
            case "close":
                window.close()
                break
            case "view": {
                const page = item.type.toLowerCase()
                window.open(`${page}.html?id=${id}`, '_blank').focus();
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
        }
    }
    function cloned() {
        return JSON.parse(JSON.stringify(item.config))
    }
    //id required as use effect flag
    function itemEditor() {
        const state = {
            globals: {
                captured, setCaptured,
                inputs: app.state.inputs,
                outputs: app.state.outputs
            }
        }
        state.config = isActive() ? cloned() : {}
        state.id = isActive() ? item.id : ""
        state.setter = isActive() ? (next) => {
            setValid(next.valid)
            setConfig(next.config)
        } : () => { }
        return Editors(type)(state)
    }
    function itemIcon() {
        return isActive() ? <img className="align-middle me-2" src={Types.icon(item.type)} width="24"
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
                    disabled={!Types.withView.includes(item.type)}
                    title="Launch item viewer">
                    View
                </Button>
                <Button variant={valid ? "primary" : "secondary"} onClick={() => onButton("save")}
                    title="Save changes but do not apply them yet">
                    Save
                </Button>
                <Button variant={valid ? "primary" : "secondary"} onClick={() => onButton("disable")}
                    title="Disable the item">
                    Disable
                </Button>
                <Button variant={valid ? "primary" : "secondary"} onClick={() => onButton("save-enable")}
                    title="Save and apply changes by re-enable the item">
                    Save and Enable
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default EditItem
