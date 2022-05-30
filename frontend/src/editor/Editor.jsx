import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Types from '../common/Types'
import Item from "../common/Item"
import Editors from './Editors'
import { useApp } from '../App'

function EditItem() {
    const app = useApp()
    const targeted = app.state.targeted
    const action = targeted.action
    function isActive() { return action === "edit" }
    const [valid, setValid] = useState(false)
    const [config, setConfig] = useState({})
    const [item, setItem] = useState({})
    useEffect(() => {
        setItem({})
        if (isActive()) {
            setValid(false)
            setConfig({})
            setItem(targeted.item)
        }
    }, [targeted.action])
    function onButton(action) {
        const id = item.id
        switch (action) {
            case "close":
                if (app.state.editor) {
                    window.close()
                } else {
                    app.dispatch({ name: "target", args: {} })
                }
                break
            case "view":
                const page = item.type.toLowerCase()
                window.open(`${page}.html?id=${id}`, '_blank').focus();
                break
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
    function getStatus() {
        const status = app.state.status[item.id]
        return status || {}
    }
    //id required as use effect flag
    function itemEditor(type) {
        const state = { globals: { inputs: app.state.inputs, outputs: app.state.outputs } }
        const match = item.id && type === item.type
        state.config = match ? cloned() : {}
        state.id = match ? item.id : ""
        state.setter = match ? (next) => {
            setValid(next.valid)
            setConfig(next.config)
        } : () => { }
        const editor = Editors(type)(state)
        //the wrapping div destroys the screen 100vh requirement
        //the need for a key make this non iterable
        return match ? editor : <div className="d-none">{editor}</div>
    }
    function itemIcon() {
        return isActive() ? <img className="align-middle me-2" src={Types.icon(item.type)} width="24"
            alt={item.type} /> : null
    }
    return (
        <Modal show={isActive()} onHide={() => onButton("close")} backdrop="static"
            centered dialogClassName="EditorModal" fullscreen keyboard={!app.state.editor}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {itemIcon()}
                    <Item.Name item={item} />
                    <Item.Status item={item} status={getStatus()} />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {itemEditor("Datafetch")}
                {itemEditor("Datalink")}
                {itemEditor("Datalog")}
                {itemEditor("Dataplot")}
                {itemEditor("Laurel")}
                {itemEditor("Modbus")}
                {itemEditor("Opto22")}
                {itemEditor("Screen")}
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
