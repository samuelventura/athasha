import React from 'react'
import Table from 'react-bootstrap/Table'
import { useApp } from '../App'

function View() {
    const app = useApp()
    const rows = app.state.names.map((name, index) => {
        return <tr key={index}>
            <td>{name}</td>
            <td>{app.state.values[name]}</td>
        </tr>
    })
    return <Table className='items mt-1' hover>
        <thead>
            <tr>
                <th className="col-6">Point Name</th>
                <th className="col-6">Point Value</th>
            </tr>
        </thead>
        <tbody>{rows}</tbody>
    </Table>
}

export default View
