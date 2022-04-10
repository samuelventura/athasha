import React, { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import Button from 'react-bootstrap/Button';

function FileHeader(props) {

    const sortUpInput = useRef(null);
    const sortDownInput = useRef(null);

    function handleSortChange(value) {
        sortUpInput.current.blur()
        sortDownInput.current.blur()
        props.onSortChange(value)
    }

    return (
        <div className="FileHeader">
            <span className="FileName">Name</span>
            <span className="FileSort">
                <Button ref={sortUpInput} onClick={() => handleSortChange("asc")} variant="link" size="sm" title="Sort Ascending">
                    <FontAwesomeIcon icon={faArrowUp} /></Button>
                <Button ref={sortDownInput} onClick={() => handleSortChange("desc")} variant="link" size="sm" title="Sort Descending">
                    <FontAwesomeIcon icon={faArrowDown} /></Button>
            </span>
        </div>
    )
}

export default FileHeader