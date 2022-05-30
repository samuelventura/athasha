import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import Button from 'react-bootstrap/Button'

//requirements
//- triggers on click
//- standard focus handling
function Header(props) {

    function onSortAsc() {
        props.setSort("asc")
    }

    function onSortDesc() {
        props.setSort("desc")
    }

    return (
        <div>
            {/* button just to match actions style */}
            <Button variant="none" className="pe-none">
                <span className="fw-bold">Name</span>
            </Button>
            <span>
                <Button onClick={onSortAsc} variant="link"
                    size="sm" title="Sort Ascending">
                    <FontAwesomeIcon icon={faArrowUp} /></Button>
                <Button onClick={onSortDesc} variant="link"
                    size="sm" title="Sort Descending">
                    <FontAwesomeIcon icon={faArrowDown} /></Button>
            </span>
        </div>
    )
}

export default Header