function FileRows(props) {

    function handleDelete(file) {
        const accept = window.confirm(`Delete file '${file.name}'?`)
        if (!accept) return
        props.dispatch({ name: "delete", args: { id: file.id } })
    }

    function handleEdit(file) {
        //window.open(env.href(`/edit/${file.id}`), '_blank')
    }

    function handleRename(file) {
        const name = window.prompt(`Rename file '${file.name}'`, file.name)
        if (name === null) return
        if (name.trim().length === 0) return
        props.dispatch({ name: "rename", args: { id: file.id, name } })
    }

    function handleEnable(file, enabled) {
        props.dispatch({ name: "enable", args: { id: file.id, enabled } })
    }

    function handleSelect(file) {
        props.dispatch({ name: "select", args: file })
    }

    function selectedClass(file) {
        return file.id === props.selected.id ?
            "FileSelected" : ""
    }

    function enabledClass(file) {
        return file.enabled ?
            "FileEnabled" : "FileDisabled"
    }

    const rows = props.files.map(file =>
        <tr key={file.id}
            onClick={() => handleSelect(file)}
            className={`FileRow ${selectedClass(file)} ${enabledClass(file)}`}>
            <td>
                <div className="FileName">{file.name}</div>
                <div className="FileActions">
                    <button onClick={() => handleEdit(file)}>Edit</button>
                    <button onClick={() => handleDelete(file)}>Delete</button>
                    <button onClick={() => handleRename(file)}>Rename</button>
                    <button onClick={() => handleEnable(file, true)}>Enable</button>
                    <button onClick={() => handleEnable(file, false)}>Disable</button>
                </div>
            </td>
        </tr>
    )

    return (
        <tbody className="FileRows">
            {rows}
        </tbody>
    )
}

export default FileRows