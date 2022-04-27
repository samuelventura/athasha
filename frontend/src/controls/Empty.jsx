import React from 'react'

const Type = "Empty"

function Init() {
    return {}
}

function Editor() {
    return null
}

function Renderer({ control, size }) {
    const type = control.type
    return (<svg>
        <text x="50%" y="50%" dominantBaseline="middle"
            textAnchor="middle" fontSize={size.height / 5}>{type}</text>
    </svg >)
}

export default { Type, Init, Editor, Renderer }
