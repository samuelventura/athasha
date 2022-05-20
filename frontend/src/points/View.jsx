import React from 'react'
import Table from 'react-bootstrap/Table'
import { useApp } from '../App'

function View() {
    const app = useApp()
    const rows = Object.entries(app.state.points).map(([name, value], index) => {
        return <tr key={index}>
            <td>{name}</td>
            <td>{value}</td>
        </tr>
    })
    return <Table className='items mt-1' hover>
        <thead>
            <tr>
                <th>Point Name</th>
                <th>Point Value</th>
            </tr>
        </thead>
        <tbody>{rows}</tbody>
    </Table>
}

export default View
