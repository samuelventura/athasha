import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { useApp } from '../App'
import State from "./State"
import Edit from './Edit'
import { ModbusEditor } from '../editors/Modbus'
import { ModbusInitial } from '../editors/Modbus'
import { DatabaseEditor } from '../editors/Database'
import { DatabaseInitial } from '../editors/Database'
import { ScreenEditor } from '../editors/Screen'
import { ScreenInitial } from '../editors/Screen'
import ModbusIcon from '../editors/Modbus.svg'
import DatabaseIcon from '../editors/Database.svg'
import ScreenIcon from '../editors/Screen.svg'

//props | store > items + initial state > UI > dirty state > store | config
//cancel | accept > clear store
function EditItem(props) {
    const app = useApp()
    const noneItem = State.initial().selected
    const [valid, setValid] = useState(false)
    const [state, setState] = useState({})
    const [config, setConfig] = useState("")
    const [item, setItem] = useState(noneItem)
    function clearState() {
        setItem(noneItem)
        setValid(false)
        setConfig("")
        setState({})
        Edit.remove()
    }
    function accept() {
        if (valid) {
            clearState()
            props.accept(item, config)
        }
    }
    function cancel() {
        clearState()
        props.cancel()
    }
    useEffect(() => {
        const item = props.item
        setItem(item)
        setValid(false)
        setState(item.id ? JSON.parse(item.config) : {})
    }, [props.item])
    useEffect(() => {
        if (app.logged) {
            const stored = Edit.fetch()
            if (stored) {
                setState(stored.state)
                setItem(stored.item)
                setValid(false)
            }
        }
    }, [app.logged])
    function store(state) {
        if (item.id) {
            Edit.create({ item, state })
            setConfig(JSON.stringify(state))
        }
    }
    const eprops = { state, store, setValid }
    function eshow(type) { return item.type === type }
    return (
        <Modal show={item.id} onHide={cancel} backdrop="static"
            centered dialogClassName="EditorModal" fullscreen>
            <Modal.Header closeButton>
                <Modal.Title>
                    <img className="align-middle me-2" src={SvgIcon(item.type)} width="24"
                        alt={item.type} />
                    <span className="align-middle">{item.name}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ModbusEditor {...eprops} show={eshow("Modbus")} />
                <DatabaseEditor {...eprops} show={eshow("Database")} />
                <ScreenEditor {...eprops} show={eshow("Screen")} />
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

function SvgIcon(type) {
    switch (type) {
        case "Modbus":
            return ModbusIcon
        case "Database":
            return DatabaseIcon
        case "Screen":
            return ScreenIcon
        default:
            return null
    }
}

function InitialState(type) {
    switch (type) {
        case "Modbus":
            return ModbusInitial()
        case "Database":
            return DatabaseInitial()
        case "Screen":
            return ScreenInitial()
        default:
            return null
    }
}

export { EditItem, SvgIcon, InitialState }
