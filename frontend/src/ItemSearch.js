import React, { useState, useEffect, useRef } from 'react'

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

//requirements
//- clears on escape
//- gets focus on load
//- triggers on any change
//- enables clear button on non-empty
//  spaces do count to match placeholder behaviour
function ItemSearch(props) {

    const input = useRef(null);
    const [filter, setFilter] = useState("")

    function handleChange(e) {
        setFilter(e.target.value)
    }

    function handleKeyUp(e) {
        if (e.key === 'Escape') {
            e.preventDefault()
            clearFilter()
        }
    }

    function clearFilter() {
        setFilter("")
    }

    //prevent form submission
    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
        }
    }

    useEffect(() => {
        setFilter(props.filter)
    }, [props])

    useEffect(() => {
        props.onFilterChange(filter)
    }, [props, filter])

    function ClearButton() {
        return filter.length > 0 ? (<Button onClick={clearFilter}
            variant="outline-secondary"
            title="Clear Filter">
            <FontAwesomeIcon icon={faTimes} />
        </Button>) : null
    }

    return (
        <div className="ItemSearch">
            <Form className="d-flex">
                <InputGroup>
                    <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
                    <Form.Control value={filter} onChange={handleChange}
                        onKeyPress={handleKeyPress} onKeyUp={handleKeyUp}
                        placeholder="Filter..." type="text" ref={input} />
                    <ClearButton />
                </InputGroup>
            </Form>
        </div>
    )
}

export default ItemSearch