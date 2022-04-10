import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import Button from 'react-bootstrap/Button';

//requirements
//- triggers on click
//- standard focus handling
function ItemHeader(props) {

    function handleSortChange(value) {
        props.onSortChange(value)
    }

    return (
        <div className="ItemHeader">
            <span className="ItemName">Name</span>
            <span className="ItemSort">
                <Button onClick={() => handleSortChange("asc")} variant="link"
                    size="sm" title="Sort Ascending">
                    <FontAwesomeIcon icon={faArrowUp} /></Button>
                <Button onClick={() => handleSortChange("desc")} variant="link"
                    size="sm" title="Sort Descending">
                    <FontAwesomeIcon icon={faArrowDown} /></Button>
            </span>
        </div>
    )
}

export default ItemHeader