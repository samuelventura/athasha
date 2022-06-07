import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Dropdown from 'react-bootstrap/Dropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from 'uuid'
import Clipboard from "../tools/Clipboard"
import Log from "../tools/Log"
import Files from '../tools/Files'
import Types from "../common/Types"
import { useApp } from '../App'

function DeleteItem() {
    const app = useApp()
    const targeted = app.state.targeted
    const action = targeted.action
    const item = targeted.item
    const [name, setName] = useState("")
    function isActive() { return action === "delete" }
    function onCancel() {
        app.dispatch({ name: "target", args: {} })
    }
    function onAccept() {
        app.send({ name: "delete", args: { id: item.id } })
        app.dispatch({ name: "target", args: {} })
    }
    useEffect(() => {
        if (isActive()) {
            setName(item.name)
        }
    }, [targeted.action])
    return (
        <Modal show={isActive()} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>Danger</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Delete item &apos;{name}&apos;?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onAccept}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

function NewItem() {
    const app = useApp()
    const targeted = app.state.targeted
    const action = targeted.action
    const [name, setName] = useState("")
    const [type, setType] = useState("")
    function isActive() { return action === "new" }
    function isValid() {
        return (name.trim().length > 0
            && type.trim().length > 0)
    }
    function onKeyPress(e) {
        if (e.key === 'Enter') {
            onAccept()
        }
    }
    function onCancel() {
        app.dispatch({ name: "target", args: {} })
    }
    function onAccept() {
        if (isValid()) {
            const config = Types.initial(type).config()
            const args = { name, type, config, enabled: false }
            app.dispatch({ name: "target", args: {} })
            app.send({ name: "create", args })
        }
    }
    useEffect(() => {
        if (isActive()) {
            setType("")
            setName("")
        }
    }, [targeted.action])
    function onTypeChanged(value) {
        setType(value)
        const token = uuidv4()
        setName(value + " " + token.substring(0, 6))
    }
    function options() {
        return Types.names.map(v => <option key={v} value={v}>{v}</option>)
    }
    return (
        <Modal show={isActive()} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>New</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select autoFocus value={type} onChange={e => onTypeChanged(e.target.value)}>
                        <option value=""></option>
                        {options()}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Name"
                        onKeyPress={onKeyPress}
                        value={name} onChange={e => setName(e.target.value)} />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={onAccept} disabled={!isValid()}>
                    Create
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

function ToolsButton() {
    const app = useApp()
    function onAction(action) {
        switch (action) {
            case "buy-license": {
                const id = app.state.identity
                window.open(`https://athasha.io/buy?id=${id}`, '_blank').focus()
                break
            }
            case "copy-identity": {
                Clipboard.copyText(app.state.identity)
                break
            }
            case "backup-licenses": {
                fetch("api/licenses")
                    .then(r => r.json())
                    .then(list => {
                        Files.downloadJson(list, app.state.hostname, Files.licenseExtension)
                    })
                break
            }
            case "install-licenses": {
                Files.uploadJson(Files.licenseExtension, function (data) {
                    Clipboard.copyText(data)
                    fetch("api/licenses", {
                        method: "POST",
                        body: JSON.stringify(data),
                        headers: { 'Content-Type': 'application/json' }
                    }).then(() => {
                        fetch("api/update").then(() => window.location.reload())
                    })
                })
                break
            }
            case "check-licenses": {
                fetch("api/check")
                break
            }
            case "refresh-info": {
                fetch("api/update").then(() => window.location.reload())
                break
            }
            default:
                Log.log("Unknown action", action)
        }
    }
    return app.logged ? (
        <Dropdown className="d-inline">
            <Dropdown.Toggle variant="link" title="System Tools">
                <FontAwesomeIcon icon={faGear} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onClick={() => onAction("buy-license")}>Buy License</Dropdown.Item>
                <Dropdown.Item onClick={() => onAction("copy-identity")}>Copy Identity</Dropdown.Item>
                <Dropdown.Item onClick={() => onAction("backup-licenses")}>Backup Licenses</Dropdown.Item>
                <Dropdown.Item onClick={() => onAction("install-licenses")}>Install Licenses</Dropdown.Item>
                <Dropdown.Item onClick={() => onAction("check-licenses")}>Check Licenses</Dropdown.Item>
                <Dropdown.Item onClick={() => onAction("refresh-info")}>Refresh Info</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    ) : null
}

function InfoButton() {
    const app = useApp()
    const identity = app.state.identity
    const licenses = app.state.licenses
    const hostname = app.state.hostname
    const items = Object.values(app.state.items).length
    const addresses = app.state.addresses.join(" ")
    const tooltip = `Identity: ${identity}\nIPs: ${addresses}\nHostname: ${hostname}\nLicenses: ${licenses}\nItems: ${items}`
    const handleOnClick = () => {
        Clipboard.copyText(tooltip)
    }
    return app.logged ? (
        <Button variant="link" onClick={handleOnClick}
            title={tooltip + "\n\nClick to Copy to Clipboard"}>
            <FontAwesomeIcon icon={faCircleInfo} />
        </Button>
    ) : null
}

function DeleteAllItems() {
    const app = useApp()
    const targeted = app.state.targeted
    const action = targeted.action
    function isActive() { return action === "delete-all" }
    function onCancel() {
        app.dispatch({ name: "target", args: {} })
    }
    function onAccept() {
        Object.values(app.state.items).forEach((item) => {
            app.send({ name: "delete", args: { id: item.id } })
        })
        app.dispatch({ name: "target", args: {} })
    }
    return (
        <Modal show={isActive()} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>Danger</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Delete All Items?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onAccept}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export {
    NewItem,
    DeleteItem,
    InfoButton,
    ToolsButton,
    DeleteAllItems,
}
