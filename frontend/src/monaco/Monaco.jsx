import React from 'react'
import { useEffect, useRef } from 'react'
import monaco from './Custom'

const model = monaco.editor.createModel("", 'javascript')

function Monaco(props) {
    const node = useRef(null)
    useEffect(() => {
        const editor = monaco.editor.create(node.current)
        editor.setModel(model)
        model.onDidChangeContent(() => {
            props.onCodeChanged(model.getValue())
        })
    }, [])
    useEffect(() => {
        if (props.code !== model.getValue()) {
            model.pushEditOperations([], [{
                range: model.getFullModelRange(),
                text: props.code,
            }])
        }
    }, [props.code])
    return <div
        ref={node} className="monacoEditor">
    </div>
}

export default Monaco
