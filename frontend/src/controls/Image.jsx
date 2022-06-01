import React from 'react'
import "../fonts/Fonts.css"
import "../fonts/Fonts"
import Initial from "./Image.js"

function Editor() {
    return (
        <>
        </>
    )
}

function Renderer() {
}

const Type = Initial.type
const Init = Initial.data
const Merge = Initial.merge
const Validate = Initial.validate

const Label = { Type, Init, Editor, Renderer, Validate, Merge }

export default Label
