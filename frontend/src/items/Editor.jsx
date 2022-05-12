import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Types from './Types'
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
    function onCancel() {
        app.dispatch({ name: "target", args: {} })
    }
    function onAccept(action) {
        const id = item.id
        switch (action) {
            case "save-only":
                app.send({ name: "edit", args: { id, config } })
                break
            case "save-close":
                app.send({ name: "edit", args: { id, config } })
                app.dispatch({ name: "target", args: {} })
                break
            case "update-only":
                app.send({ name: "edit", args: { id, config } })
                app.send({ name: "enable", args: { id, enabled: true } })
                break
            case "update-close":
                app.send({ name: "edit", args: { id, config } })
                app.send({ name: "enable", args: { id, enabled: true } })
                app.dispatch({ name: "target", args: {} })
                break
        }
    }
    function cloned() {
        return JSON.parse(JSON.stringify(item.config))
    }
    //id required for view url formation
    function itemEditor(type) {
        const state = { globals: { points: app.state.points } }
        const match = item.id && type === item.type
        state.config = match ? cloned() : {}
        state.id = match ? item.id : ""
        state.setter = match ? (next) => {
            setValid(next.valid)
            setConfig(next.config)
        } : () => { }
        const editor = Types.editor(type)(state)
        //the wrapping div destroys the screen 100vh requirement
        //the need for a key make this non iterable
        return match ? editor : <div className="d-none">{editor}</div>
    }
    function itemIcon() {
        return isActive() ? <img className="align-middle me-2" src={Types.icon(item.type)} width="24"
            alt={item.type} /> : null
    }
    return (
        <Modal show={isActive()} onHide={onCancel} backdrop="static"
            centered dialogClassName="EditorModal" fullscreen>
            <Modal.Header closeButton>
                <Modal.Title>
                    {itemIcon()}
                    <span className="align-middle">{item.name}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {itemEditor("Database")}
                {itemEditor("Dataplot")}
                {itemEditor("Laurel")}
                {itemEditor("Modbus")}
                {itemEditor("Opto22")}
                {itemEditor("Screen")}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant={valid ? "primary" : "secondary"} onClick={() => onAccept("save-only")}>
                    Save
                </Button>
                <Button variant={valid ? "primary" : "secondary"} onClick={() => onAccept("save-close")}>
                    Save and Close
                </Button>
                <Button variant={valid ? "primary" : "secondary"} onClick={() => onAccept("update-only")}>
                    Update
                </Button>
                <Button variant={valid ? "primary" : "secondary"} onClick={() => onAccept("update-close")}>
                    Update and Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default EditItem
