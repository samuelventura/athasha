import { useState, useEffect } from 'react'
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
    const [name, setName] = useState("")
    function enabled() {
        return (name.trim().length > 0)
    }
    function accept() {
        props.accept(name)
    }
    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            if (enabled()) {
                accept()
            }
        }
    }
    return (
        <Modal show={props.show} onHide={props.cancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>New</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Control autoFocus type="text" placeholder="Name"
                    onKeyPress={handleKeyPress}
                    value={name} onChange={e => setName(e.target.value)} />
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
