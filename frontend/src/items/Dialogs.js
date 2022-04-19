import { useState, useEffect, useRef } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'

function DeleteItem(props) {
    const item = props.item
    return (
        <Modal show={item.id} onHide={props.cancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>Danger</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Delete item '{item.name}'?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.cancel}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={() => props.accept(item)}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

function RenameItem(props) {
    const item = props.item
    const [name, setName] = useState("")
    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            props.accept(item, name)
        }
    }
    useEffect(() => {
        setName(item.name || "")
    }, [item])
    return (
        <Modal show={item.id} onHide={props.cancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>Rename</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Control autoFocus type="text" placeholder="New Name"
                    onKeyPress={handleKeyPress}
                    value={name} onChange={e => setName(e.target.value)} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.cancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={() => props.accept(item, name)}>
                    Rename
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

function NewItem(props) {
    const nameEl = useRef(null);
    const [name, setName] = useState("")
    const [type, setType] = useState("")
    const [prev, setPrev] = useState("")
    function enabled() {
        return (name.trim().length > 0
            && type.trim().length > 0)
    }
    function accept() {
        props.accept(name, type)
    }
    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            if (enabled()) {
                accept()
            }
        }
    }
    function option(type) {
        return (<option value={type}>{type}</option>)
    }
    useEffect(() => { setPrev(type) }, [type])
    useEffect(() => {
        if (type.trim().length > 0 && prev !== type) {
            const token = crypto.randomUUID();
            setName(type + " " + token.substring(0, 6))
            nameEl.current.focus()
        }
    }, [name, prev, type])
    useEffect(() => {
        if (props.show) setType("Modbus Reader")
        else {
            setName("")
            setType("")
        }
    }, [props.show])
    return (
        <Modal show={props.show} onHide={props.cancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>New</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select autoFocus value={type} onChange={e => setType(e.target.value)}>
                        {option("Modbus Reader")}
                        {option("Database Writer")}
                        {option("")}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control ref={nameEl} type="text" placeholder="Name"
                        onKeyPress={handleKeyPress}
                        value={name} onChange={e => setName(e.target.value)} />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.cancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={accept} disabled={!enabled()}>
                    Create
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export { NewItem, DeleteItem, RenameItem }
