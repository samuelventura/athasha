import React from 'react'

function FileNew(props) {

    function handleNew() {
        const template = "Script"
        const name = window.prompt(`Name for New ${template}`, `New ${template}`)
        if (name === null) return
        const data = ""
        props.dispatch({ name: "create", args: { name, data } })
    }

    return (
        <div className="FileNew">
            <button onClick={handleNew}>New...</button>
        </div>
    )
}

export default FileNew