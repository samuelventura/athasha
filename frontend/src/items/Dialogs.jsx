import { useState, useEffect, useRef } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Dropdown from 'react-bootstrap/Dropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { faEthernet } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from 'uuid'
import Clipboard from "../tools/Clipboard"
import Router from '../tools/Router'
import Files from '../tools/Files'
import Initials from "./Initials"
import Types from "./Types"
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
                Delete item '{name}'?
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

function RenameItem() {
    const app = useApp()
    const targeted = app.state.targeted
    const action = targeted.action
    const item = targeted.item
    const focus = useRef(null)
    const [name, setName] = useState("")
    function isActive() { return action === "rename" }
    function isValid() { return (name.trim().length) }
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
            app.send({ name: "rename", args: { id: item.id, name } })
            app.dispatch({ name: "target", args: {} })
        }
    }
    useEffect(() => {
        if (isActive()) {
            setName(item.name)
            //autoFocus fails with inputs but works with select above
            setTimeout(() => {
                const el = focus.current
                if (el) {
                    el.focus()
                    el.select()
                }
            }, 0)
        }
    }, [targeted.action])
    return (
        <Modal show={isActive()} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>Rename</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Control autoFocus ref={focus} type="text" placeholder="New Name"
                    onKeyPress={onKeyPress}
                    value={name} onChange={e => setName(e.target.value)} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={onAccept} disabled={!isValid()}>
                    Rename
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
            const config = Initials(type).config()
            const args = { name, type, config, enabled: false }
            app.send({ name: "create", args })
            app.dispatch({ name: "target", args: {} })
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
        return Types.names.map((type, index) => (<option key={index} value={type}>{type}</option>))
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
                        <option></option>
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
    function buyLicense() {
        const id = app.state.identity
        window.open(`https://athasha.io/buy?id=${id}`, '_blank').focus();
    }
    function viewList() {
        window.open("views.html", '_blank').focus();
    }
    function copyIdentity() {
        Clipboard.copyText(app.state.identity)
    }
    function backupItems() {
        const items = Object.values(app.state.items).map(item => {
            return {
                id: item.id,
                name: item.name,
                type: item.type,
                enabled: item.enabled,
                config: item.config,
            }
        })
        Files.downloadJson(items, Files.backupExtension)
    }
    function restoreItems() {
        Files.uploadJson(Files.backupExtension, function (data) {
            app.send({ name: "restore", args: data })
        })
    }
    function backupLicenses() {
        fetch("api/licenses")
            .then(r => r.json())
            .then(list => {
                Files.downloadJson(list, Files.licenseExtension)
            })
    }
    function installLicense() {
        Files.uploadJson(Files.licenseExtension, function (data) {
            Clipboard.copyText(data)
            fetch("api/licenses", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            }).then(() => { updateAndReload() })
        })
    }
    function checkLicenses() {
        fetch("api/check")
    }
    function updateAndReload() {
        fetch("api/update").then(() => window.location.reload())
    }
    return app.logged ? (
        <Dropdown className="d-inline">
            <Dropdown.Toggle variant="link" title="System Tools">
                <FontAwesomeIcon icon={faGear} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onClick={viewList}>View List</Dropdown.Item>
                <Dropdown.Item onClick={buyLicense}>Buy License</Dropdown.Item>
                <Dropdown.Item onClick={copyIdentity}>Copy Identity</Dropdown.Item>
                <Dropdown.Item onClick={backupItems}>Backup Items</Dropdown.Item>
                <Dropdown.Item onClick={restoreItems}>Restore Items</Dropdown.Item>
                <Dropdown.Item onClick={backupLicenses}>Backup Licenses</Dropdown.Item>
                <Dropdown.Item onClick={installLicense}>Install License</Dropdown.Item>
                <Dropdown.Item onClick={checkLicenses}>Check Licenses</Dropdown.Item>
                <Dropdown.Item onClick={updateAndReload}>Refresh Info</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    ) : null
}

function HostButton() {
    const app = useApp()
    const addresses = [app.state.hostname, ...app.state.addresses, "localhost", "127.0.0.1"]
    const dropdownItems = addresses.map((ip, index) =>
        <Dropdown.Item key={index} href={Router.reHost(ip)}>{ip}</Dropdown.Item>
    )
    return app.logged ? (
        <Dropdown className="d-inline">
            <Dropdown.Toggle variant="link" title="Change Hostname/IP">
                <FontAwesomeIcon icon={faEthernet} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {dropdownItems}
            </Dropdown.Menu>
        </Dropdown>
    ) : null
}

function InfoButton() {
    const app = useApp()
    const identity = app.state.identity
    const licenses = app.state.licenses
    const hostname = app.state.hostname
    const addresses = app.state.addresses.join(" ")
    const tooltip = `Identity: ${identity}\nIPs: ${addresses}\nHostname: ${hostname}\nLicenses: ${licenses}`
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

export { NewItem, DeleteItem, RenameItem, InfoButton, HostButton, ToolsButton }
