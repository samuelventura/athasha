import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import State from "./State"
import Edit from './Edit'
import Modbus from '../editors/Modbus'
import Database from '../editors/Database'
import Screen from '../editors/Screen'
import Dataplot from '../editors/Dataplot'

//props | store > items + initial state > UI > dirty state > store | config
//cancel | accept > clear store
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
        Edit.remove()
    }
    function saveForView() {
        const config = JSON.parse(next)
        props.accept(item, config, true)
    }
    function accept() {
        if (valid) {
            const config = JSON.parse(next)
            props.accept(item, config)
            clearState()
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
    useEffect(() => {
        if (props.logged) {
            const stored = Edit.fetch()
            if (stored) {
                setState(stored.state)
                setItem(stored.item)
                setValid(false)
            }
        }
    }, [props.logged])
    function store(state) {
        if (item.id) {
            Edit.create({ item, state })
            setNext(JSON.stringify(state))
        }
    }
    const eprops = { state, store, valid, setValid, saveForView, id: item.id }
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
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={cancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={accept} disabled={!valid}>
                    Save
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
        default:
            return null
    }
}

export { ItemEditor, ItemIcon, ItemInitial }
