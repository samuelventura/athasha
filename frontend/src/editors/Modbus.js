import React, { useState, useEffect } from 'react'

function Editor(props) {
    const item = props.item
    return props.show ? (
        <div>{item.type}</div>
    ) : null
}

export default Editor
