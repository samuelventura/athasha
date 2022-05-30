import React from 'react'
import Button from 'react-bootstrap/Button'
import Types from "../common/Types"
import Item from "../common/Item"
import { useApp } from '../App'

function Rows(props) {
    const app = useApp()

    const rows = props.items.map(item => {
        return Types.withView.includes(item.type) ? (
            <tr key={item.id} id={"item_" + item.id}
                onDoubleClick={() => Item.onView(item)}
                className='align-middle'>
                <Item.Td item={item} status={app.state.status[item.id]} />
                <td>
                    <Button variant="link" onClick={() => Item.onView(item)}>View</Button>
                </td>
            </tr>) : null
    })

    return (
        <tbody>
            {rows}
        </ tbody>
    )
}

export default Rows
