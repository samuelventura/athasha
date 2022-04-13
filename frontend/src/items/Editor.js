import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { useApp } from '../App'
import Edit from './Edit'
import ModbusDeviceEditor from '../editors/Modbus'

function EditItem(props) {
    const app = useApp()
    const [valid, setValid] = useState(false)
    const [state, setState] = useState({})
    const [config, setConfig] = useState("")
    const [item, setItem] = useState({})
    function accept() {
        if (valid) {
            props.accept(item, config)
            Edit.remove()
        }
    }
    function cancel() {
        Edit.remove()
        props.cancel()
    }
    function store(state) {
        if (item.id) Edit.create({ item, state })
    }
    useEffect(() => {
        const item = props.item
        setItem(item)
        if (item.id) setState(JSON.parse(item.config))
    }, [props.item])
    useEffect(() => {
        if (app.logged) {
            const stored = Edit.fetch()
            if (stored) {
                setState(stored.state)
                setItem(stored.item)
            }
        }
    }, [app.logged])
    const eprops = { state, store, setConfig, setValid }
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
