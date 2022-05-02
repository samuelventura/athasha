import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import { useApp } from '../App'
import { NewItem } from "./Dialogs"
import { ItemInitial } from "./Editor"

function New(props) {
    const app = useApp()
    const [newItem, setNewItem] = useState(false)

    function showNew() {
        setNewItem(true)
    }

    function handleNew(name, type) {
        setNewItem(false)
        const config = ItemInitial(type)
        const args = { name, type, config, enabled: false }
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