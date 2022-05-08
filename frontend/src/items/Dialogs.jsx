import { useState, useEffect, useRef } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Dropdown from 'react-bootstrap/Dropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo } from '@fortawesome/free-solid-svg-icons'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { faEthernet } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from 'uuid'
import Environ from '../Environ'
import Files from './Files'
import { useApp } from '../App'

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
    const nameEl = useRef(null)
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
            const token = uuidv4()
            setName(type + " " + token.substring(0, 6))
            nameEl.current.focus()
        }
    }, [name, prev, type])
    useEffect(() => {
        if (props.show) setType("Modbus")
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
                        {option("")}
                        {option("Modbus")}
                        {option("Screen")}
                        {option("Database")}
                        {option("Dataplot")}
                        {option("Laurel")}
                        {option("Opto22")}
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

function ToolsButton() {
    const app = useApp()
    function buyLicense() {
        const id = app.state.identity
        window.open(`https://athasha.io/buy?id=${id}`, '_blank').focus();
    }
    function copyIdentity() {
        navigator.clipboard.writeText(app.state.identity)
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
        Files.download(items, "athasha.backup.json")
    }
    function restoreItems() {
        Files.upload("athasha.backup.json", function (data) {
            app.send({ name: "restore", args: data })
        })
    }
    function backupLicenses() {
        fetch("api/licenses")
            .then(r => r.json())
            .then(list => {
                Files.download(list, "athasha.license.json")
            })
    }
    function installLicense() {
        Files.upload("athasha.license.json", function (data) {
            fetch("api/licenses", {
                method: "POST",
                body: data,
                headers: { 'Content-Type': 'application/json' }
            }).then(() => { fetch("api/update").then(() => window.location.reload()) })
        })
    }
    return app.logged ? (
        <Dropdown className="d-inline pt-1">
            <Dropdown.Toggle variant="link" title="System Tools">
                <FontAwesomeIcon icon={faGear} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onClick={buyLicense}>Buy License</Dropdown.Item>
                <Dropdown.Item onClick={copyIdentity}>Copy Identity</Dropdown.Item>
                <Dropdown.Item onClick={backupItems}>Backup Items</Dropdown.Item>
                <Dropdown.Item onClick={restoreItems}>Restore Items</Dropdown.Item>
                <Dropdown.Item onClick={backupLicenses}>Backup Licenses</Dropdown.Item>
                <Dropdown.Item onClick={installLicense}>Install License</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    ) : null
}

function HostButton() {
    const app = useApp()
    const ips = [app.state.hostname, ...app.state.ips, "localhost", "127.0.0.1"]
    const dropdownItems = ips.map((ip, index) =>
        <Dropdown.Item key={index} href={Environ.reHost(ip)}>{ip}</Dropdown.Item>
    )
    return app.logged ? (
        <Dropdown className="d-inline pt-1">
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
    const ips = app.state.ips.join(" ")
    const tooltip = `Identity: ${identity}\nIPs: ${ips}\nHostname: ${hostname}\nLicenses: ${licenses}`
    const handleOnClick = () => {
        navigator.clipboard.writeText(tooltip)
    }
    return app.logged ? (
        <Button variant="link" onClick={handleOnClick} title={tooltip + "\n\nClick to Copy to Clipboard"}>
            <FontAwesomeIcon icon={faInfo} />
        </Button>
    ) : null
}

export { NewItem, DeleteItem, RenameItem, InfoButton, HostButton, ToolsButton }
