import React from 'react'
import Button from 'react-bootstrap/Button';

function New(props) {

    function handleNew() {
        const template = "Script"
        const name = window.prompt(`Name for New ${template}`, `New ${template}`)
        if (name === null) return
        const data = ""
        props.dispatch({ name: "create", args: { name, data } })
    }

    return (
        <div>
            <Button onClick={handleNew} variant="light">New...</Button>
        </div>
    )
}

export default New