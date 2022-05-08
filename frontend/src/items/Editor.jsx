import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import State from "./State"
import Modbus from '../editors/Modbus'
import Database from '../editors/Database'
import Screen from '../editors/Screen'
import Dataplot from '../editors/Dataplot'
import Laurel from '../editors/Laurel'

function ItemEditor(props) {
    const noneItem = State.initial().selected
    const [valid, setValid] = useState(false)
    const [state, setState] = useState({})
    const [next, setNext] = useState("")
    const [item, setItem] = useState(noneItem)
    function clearState() {
        setItem(noneItem)
        setValid(false)
        setNext("")
        setState({})
    }
    function accept(action) {
        const config = JSON.parse(next)
        props.accept(item, config, action)
        switch (action) {
            case "save-close":
                clearState()
                break
        }
    }
    function cancel() {
        props.cancel()
        clearState()
    }
    useEffect(() => {
        const item = props.item
        if (item.id) {
            setItem(item)
            setValid(false)
            setState(item.config)
        }
    }, [props.item])
    function store(state) {
        if (item.id) {
            setNext(JSON.stringify(state))
        }
    }
    const eprops = { state, store, accept, setValid, id: item.id }
    function eshow(type) { return item.type === type }
    return (
        <Modal show={item.id} onHide={cancel} backdrop="static"
            centered dialogClassName="EditorModal" fullscreen>
            <Modal.Header closeButton>
                <Modal.Title>
                    <img className="align-middle me-2" src={ItemIcon(item.type)} width="24"
                        alt={item.type} />
                    <span className="align-middle">{item.name}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Modbus.ItemEditor {...eprops} show={eshow("Modbus")} />
                <Database.ItemEditor {...eprops} show={eshow("Database")} />
                <Screen.ItemEditor {...eprops} show={eshow("Screen")} />
                <Dataplot.ItemEditor {...eprops} show={eshow("Dataplot")} />
                <Laurel.ItemEditor {...eprops} show={eshow("Laurel")} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={cancel}>
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

function ItemIcon(type) {
    switch (type) {
        case "Modbus":
            return Modbus.ItemIcon
        case "Database":
            return Database.ItemIcon
        case "Screen":
            return Screen.ItemIcon
        case "Dataplot":
            return Dataplot.ItemIcon
        case "Laurel":
            return Laurel.ItemIcon
        default:
            return null
    }
}

function ItemInitial(type) {
    switch (type) {
        case "Modbus":
            return Modbus.ItemInitial()
        case "Database":
            return Database.ItemInitial()
        case "Screen":
            return Screen.ItemInitial()
        case "Dataplot":
            return Dataplot.ItemInitial()
        case "Laurel":
            return Laurel.ItemInitial()
        default:
            return null
    }
}

export { ItemEditor, ItemIcon, ItemInitial }
