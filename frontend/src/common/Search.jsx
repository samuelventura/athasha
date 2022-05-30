import React, { useState, useEffect, useRef } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import Log from '../tools/Log'

//requirements
//- clears on escape
//- gets focus on load
//- triggers on any change
//- enables clear button on non-empty
// spaces do count to match placeholder behaviour
function Search(props) {
    Log.react("Search")
    const input = useRef(null)
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

    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            //prevent form submission
            e.preventDefault()
        }
    }

    useEffect(() => {
        setFilter(props.filter)
    }, [props.filter])

    useEffect(() => {
        props.onFilterChange(filter)
    }, [filter, props.onFilterChange])

    function ClearButton() {
        return filter.length > 0 ? (<Button onClick={clearFilter}
            variant="outline-secondary"
            title="Clear Filter">
            <FontAwesomeIcon icon={faTimes} />
        </Button>) : null
    }

    return (
        <div>
            <Form>
                <InputGroup>
                    <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
                    <Form.Control autoFocus value={filter} onChange={handleChange}
                        onKeyPress={handleKeyPress} onKeyUp={handleKeyUp}
                        placeholder="Filter..." type="text" ref={input} />
                    <ClearButton />
                </InputGroup>
            </Form>
        </div>
    )
}

export default Search