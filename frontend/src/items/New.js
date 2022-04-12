import React from 'react'
import Button from 'react-bootstrap/Button';

function New(props) {

    function item(name, type, version, config) {
        return {
            name,
            type,
            config,
            version,
            enabled: false,
        }
    }

    function handleNew() {
        const template = "Script"
        const name = window.prompt(`Name for New ${template}`, `New ${template}`)
        if (name === null) return
        const args = item(name, "Script", 1, "Script Content")
        props.send({ name: "create", args })
    }

    return (
        <div>
            <Button onClick={handleNew} variant="light">New...</Button>
        </div>
    )
}

export default New