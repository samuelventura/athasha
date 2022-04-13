import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'

function Editor(props) {
    const state = props.state
    const [name, setName] = useState("")
    //initialize spread state here
    useEffect(() => {
        setName(state.name || "")
    }, [state])
    //rebuild state back here
    useEffect(() => {
        let valid = true
        valid = valid && (name.trim().length > 0)
        props.setValid(valid)
        const state = {
            name
        }
        props.store(state)
        props.setConfig(JSON.stringify(state))
    })
    return props.show ? (
        <>
            <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control autoFocus type="text" placeholder="Name"
                    value={name} onChange={e => setName(e.target.value)} />
            </Form.Group>
        </>
    ) : null
}

export default Editor
