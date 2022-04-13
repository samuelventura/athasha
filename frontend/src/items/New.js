import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button';
import { useApp } from '../App';
import { NewItem } from "./Dialogs"

function New(props) {
    const app = useApp()
    const [newItem, setNewItem] = useState(false)

    function item(name, type, version, config) {
        return {
            name,
            type,
            config,
            version,
            enabled: false,
        }
    }

    function showNew() {
        setNewItem(true)
    }

    function handleNew(name) {
        setNewItem(false)
        if (!name.trim().length) return
        const args = item(name, "Script", 1, "Script Content")
        props.send({ name: "create", args })
    }

    function clearNew() {
        setNewItem(false)
    }

    useEffect(() => {
        if (!app.logged) setNewItem(false)
    }, [app.logged])

    return (
        <div>
            <NewItem show={newItem} accept={handleNew} cancel={clearNew} />
            <Button onClick={showNew} variant="primary">New...</Button>
        </div>
    )
}

export default New