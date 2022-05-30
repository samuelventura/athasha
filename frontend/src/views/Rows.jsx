import Button from 'react-bootstrap/Button'
import { useApp } from '../App'
import Types from "../common/Types"
import Item from "../common/Item"

function Rows(props) {
    const app = useApp()

    const rows = props.items.map(item => {
        return Types.withView.includes(item.type) ? (
            <tr key={item.id} id={"item_" + item.id}
                onDoubleClick={(e) => Item.onView(item)}
                className='align-middle'>
                <Item.Td item={item} status={app.state.status[item.id]} />
                <td>
                    <Button variant="link" onClick={(e) => Item.onView(item)}>View</Button>
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
