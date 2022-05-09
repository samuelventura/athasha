import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Types from './Types'
import Points from './Points'
import { useApp } from '../App'

function Editor(props) {
    const app = useApp()
    const item = props.item
    const [valid, setValid] = useState(false)
    const [config, setConfig] = useState({})
    const points = Points.Options(app.state.items)
    useEffect(() => {
        setValid(false)
        setConfig({})
    }, [item.id])
    function accept(action) {
        const id = item.id
        props.accept(id, config, action)
    }
    function itemEditor(type) {
        const state = { points }
        const match = item.id && type === item.type
        state.config = match ? item.config : {}
        //id required for view url formation
        state.id = match ? item.id : ""
        state.setter = match ? (next) => {
            setValid(next.valid)
            setConfig(next.config)
        } : () => { }
        return Types.editor(type)(state)
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
                {/* {itemEditor("Screen")}
                {itemEditor("Modbus")}
                {itemEditor("Dataplot")}
                {itemEditor("Laurel")}
                {itemEditor("Opto22")} */}
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
