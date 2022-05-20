import React from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Clipboard from '../tools/Clipboard'
import { useApp } from '../App'

function View() {
    const app = useApp()
    function pointId(name) { return `${app.state.id} ${name}` }
    function onCopyId(point) {
        Clipboard.copyText(point)
    }
    function onGet(point) {
        const id = btoa(point)
        window.open(`api/point?id=${id}`, '_blank').focus();
    }
    const rows = app.state.names.map((name, index) => {
        const point = pointId(name)
        return <tr key={index} className="align-middle">
            <td title={point}>{name}</td>
            <td>{app.state.values[name]}</td>
            <td>
                <Button variant="link" onClick={() => onGet(point)}>GET</Button>
                <Button variant="link" onClick={() => onCopyId(point)}>Copy ID</Button>
            </td>
        </tr>
    })
    return <Table className='items mt-1' hover>
        <thead>
            <tr>
                <th className="col-4">Point Name</th>
                <th className="col-4">Point Value</th>
                <th className="col-4">Actions</th>
            </tr>
        </thead>
        <tbody>{rows}</tbody>
    </Table>
}

export default View
