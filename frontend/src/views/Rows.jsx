import Button from 'react-bootstrap/Button'
import { useApp } from '../App'
import Types from "../items/Types"
import Status from "../items/Status"

function Rows(props) {
    const app = useApp()

    function enabledClass(item) {
        return item.enabled ?
            "fw-normal" : "fst-italic"
    }

    function handleClick(item) {
        const page = item.type.toLowerCase()
        window.open(`${page}.html?id=${item.id}`, '_blank').focus();
    }

    const rows = props.items.map(item => {
        return Types.withView.includes(item.type) ? (
            <tr key={item.id} id={"item_" + item.id}
                onDoubleClick={(e) => handleClick(item)}
                className='align-middle' title={item.id}>
                <td className={enabledClass(item)}>
                    <img src={Types.icon(item.type)} width="20"
                        alt={item.type} className='me-2' />
                    <span className='align-middle user-select-none'>{item.name}</span>
                    <Status item={item} status={app.state.status[item.id]} />
                </td>
                <td>
                    <Button variant="link" onClick={(e) => handleClick(item)}>View</Button>
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
