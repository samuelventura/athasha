function ItemRows(props) {

    function handleDelete(item) {
        const accept = window.confirm(`Delete item '${item.name}'?`)
        if (!accept) return
        props.dispatch({ name: "delete", args: { id: item.id } })
    }

    function handleEdit(item) {
        //window.open(env.href(`/edit/${item.id}`), '_blank')
    }

    function handleRename(item) {
        const name = window.prompt(`Rename item '${item.name}'`, item.name)
        if (name === null) return
        if (name.trim().length === 0) return
        props.dispatch({ name: "rename", args: { id: item.id, name } })
    }

    function handleEnable(item, enabled) {
        props.dispatch({ name: "enable", args: { id: item.id, enabled } })
    }

    function handleSelect(item) {
        props.dispatch({ name: "select", args: item })
    }

    function selectedClass(item) {
        return item.id === props.selected.id ?
            "ItemSelected" : ""
    }

    function enabledClass(item) {
        return item.enabled ?
            "ItemEnabled" : "ItemDisabled"
    }

    const rows = props.items.map(item =>
        <tr key={item.id}
            onClick={() => handleSelect(item)}
            className={`ItemRow ${selectedClass(item)} ${enabledClass(item)}`}>
            <td>
                <div className="ItemName">{item.name}</div>
                <div className="ItemActions">
                    <button onClick={() => handleEdit(item)}>Edit</button>
                    <button onClick={() => handleDelete(item)}>Delete</button>
                    <button onClick={() => handleRename(item)}>Rename</button>
                    <button onClick={() => handleEnable(item, true)}>Enable</button>
                    <button onClick={() => handleEnable(item, false)}>Disable</button>
                </div>
            </td>
        </tr>
    )

    return (
        <tbody className="ItemRows">
            {rows}
        </tbody>
    )
}

export default ItemRows