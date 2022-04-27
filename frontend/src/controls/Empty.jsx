import React from 'react'

const Type = "Empty"

function Renderer({ control, size }) {
    const type = control.type
    return (<svg>
        <text x="50%" y="50%" dominantBaseline="middle"
            textAnchor="middle" fontSize={size.height / 4}
            fontFamily="monospace">
            {type}
        </text>
    </svg >)
}

export default { Type, Renderer }
