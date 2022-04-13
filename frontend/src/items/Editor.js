import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { useApp } from '../App'
import State from "./State"
import Edit from './Edit'
import ModbusDeviceEditor from '../editors/Modbus'

// props | store > items + initial state > UI > dirty state > store | config
// cancel | accept > clear store
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
        <Modal show={item.id} onHide={cancel} backdrop="static" centered>
            <Modal.Header closeButton>
                <Modal.Title>{item.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ModbusDeviceEditor {...eprops} show={eshow("Modbus Device")} />
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

export { EditItem }
