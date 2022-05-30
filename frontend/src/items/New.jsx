import React from 'react'
import Button from 'react-bootstrap/Button'
import { useApp } from '../App'
import { NewItem } from "./Dialogs"

function New() {
    const app = useApp()

    function showNew() {
        app.dispatch({ name: "target", args: { action: "new" } })
    }

    return (
        <div>
            <NewItem />
            <Button onClick={showNew} variant="primary"
                title="Create New Item">New...</Button>
        </div>
    )
}

export default New