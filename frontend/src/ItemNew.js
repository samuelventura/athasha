import React from 'react'
import Button from 'react-bootstrap/Button';

function ItemNew(props) {

    function handleNew() {
        const template = "Script"
        const name = window.prompt(`Name for New ${template}`, `New ${template}`)
        if (name === null) return
        const data = ""
        props.dispatch({ name: "create", args: { name, data } })
    }

    return (
        <div className="ItemNew">
            <Button onClick={handleNew} variant="link">New...</Button>
        </div>
    )
}

export default ItemNew