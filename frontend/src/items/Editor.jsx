import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Editors from './Editors'
import State from "./State"

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
    function itemEditor(item) {
        const control = Editors[item.type]
        return control?.ItemEditor({ show: true, ...eprops })
    }
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
                {itemEditor(item)}
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
    return Editors[type]?.ItemIcon
}

function ItemInitial(type) {
    return Editors[type]?.ItemInitial()
}

export { ItemEditor, ItemIcon, ItemInitial }
