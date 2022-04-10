import React, { useState, useEffect, useRef } from 'react'

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

function FileSearch(props) {

    const input = useRef(null);
    const [filter, setFilter] = useState("")

    function handleChange(e) {
        setFilter(e.target.value)
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            applyFilter()
        }
    }

    function handleKeyUp(e) {
        if (e.key === 'Escape') {
            setFilter("")
        }
    }

    function applyFilter() {
        //single point to trigger filtering
        props.onFilterChange(filter)
    }

    function clearFilter() {
        setFilter("")
    }

    useEffect(() => {
        setFilter(props.filter)
        if (input.current != null) {
            input.current.focus();
        }
    }, [props])

    return (
        <div className="FileSearch">
            <Form className="d-flex">
                <InputGroup>
                    <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
                    <Form.Control value={filter} onChange={handleChange}
                        onKeyPress={handleKeyPress} onKeyUp={handleKeyUp}
                        placeholder="Filter..." type="text" ref={input} />
                    <Button onClick={applyFilter} variant="outline-secondary" title="Apply Filter">Search</Button>
                    <Button onClick={clearFilter} variant="outline-secondary" title="Clear Filter">Clear</Button>
                </InputGroup>
            </Form>
        </div>
    )
}

export default FileSearch