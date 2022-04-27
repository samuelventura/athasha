import React from 'react'
import Form from 'react-bootstrap/Form'
import { FormEntry } from './Helper'

const Type = "Label"

function Init() {
    return {
        text: "Label"
    }
}

function Editor({ control, setProp }) {
    const data = control.data
    return (<>
        <FormEntry label="Text">
            <Form.Control type="text" value={data.text}
                onChange={e => setProp("text", e.target.value)} />
        </FormEntry>
    </>)
}

function Renderer({ control, size }) {
    const setts = control.setts
    const data = control.data
    return (
        <svg>
            <rect width="100%" height="100%" fill="white" />
            <text x="50%" y="50%" dominantBaseline="middle"
                textAnchor="middle" fontSize={size.height / 5}>{data.text}</text>
        </svg>
    )
}

export default { Type, Init, Editor, Renderer }
