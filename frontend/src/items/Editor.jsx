import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Points from "../items/Points"
import Types from './Types'
import { useApp } from '../App'

function Editor(props) {
    const app = useApp()
    const item = props.item
    const [valid, setValid] = useState(false)
    const [config, setConfig] = useState({})
    const [globals, setGlobals] = useState({})
    useEffect(() => {
        setValid(false)
        setConfig({})
        if (item.id) updatePoints()
    }, [item.id])
    function updatePoints() {
        const items = app.state.items
        const next = { ...globals }
        next.points = Points.options(items)
        setGlobals(next)
    }
    function accept(action) {
        const id = item.id
        props.accept(id, config, action)
    }
    function cloned() {
        return JSON.parse(JSON.stringify(item.config))
    }
    //id required for view url formation
    function itemEditor(type) {
        const state = { globals }
        const match = item.id && type === item.type
        state.config = match ? cloned() : {}
        state.id = match ? item.id : ""
        state.setter = match ? (next) => {
            setValid(next.valid)
            setConfig(next.config)
        } : () => { }
        const editor = Types.editor(type)(state)
        //the wrapping div destroys the screen 100vh requirement
        return match ? editor : <div className="d-none">{editor}</div>
    }
    function itemIcon() {
        const icon = Types.icon(item.type)
        return icon ? <img className="align-middle me-2" src={icon} width="24"
            alt={item.type} /> : null
    }
    return (
        <Modal show={item.id} onHide={props.cancel} backdrop="static"
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
                <Button variant="secondary" onClick={props.cancel}>
                    Cancel
                </Button>
                <Button variant={valid ? "primary" : "secondary"} onClick={() => accept("save")}>
                    Save
                </Button>
                <Button variant={valid ? "primary" : "secondary"} onClick={() => accept("save-close")}>
                    Save and Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default Editor
