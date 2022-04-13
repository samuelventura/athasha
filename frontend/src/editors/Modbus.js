import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'

// conditional rendering to avoid store calls from all editors
// props.children always changes preventing a generic If implementation
function IfEditor(props) {
    return props.show ? (<Editor {...props} />) : null
}

function Editor(props) {
    const [name, setName] = useState("")
    // initialize local state
    useEffect(() => {
        const state = props.state
        setName(state.name || "")
    }, [props.state])
    // rebuild and store state
    useEffect(() => {
        let valid = true
        valid = valid && (name.trim().length > 0)
        props.setValid(valid)
        props.store({
            name
        })
    }, [props, name])
    return (
        <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control autoFocus type="text" placeholder="Name"
                value={name} onChange={e => setName(e.target.value)} />
        </Form.Group>
    )
}

export default IfEditor
