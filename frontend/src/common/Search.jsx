import React, { useRef } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

function ClearButton({ filter, clear }) {
    return filter.length > 0 ? (<Button onClick={clear}
        variant="outline-secondary"
        title="Clear Filter">
        <FontAwesomeIcon icon={faTimes} />
    </Button>) : null
}

//requirements
//- clears on escape
//- gets focus on load
//- triggers on any change
//- enables clear button on non-empty
// spaces do count to match placeholder behaviour
function Search(props) {
    const input = useRef(null)

    function handleChange(e) {
        const value = e.target.value
        props.setFilter(value)
    }

    function handleKeyUp(e) {
        if (e.key === 'Escape') {
            e.preventDefault()
            clearFilter()
        }
    }

    function clearFilter() {
        props.setFilter("")
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            //prevent form submission
            e.preventDefault()
        }
    }

    return (
        <div>
            <Form>
                <InputGroup>
                    <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
                    <Form.Control autoFocus value={props.filter} onChange={handleChange}
                        onKeyPress={handleKeyPress} onKeyUp={handleKeyUp}
                        placeholder="Filter..." type="text" ref={input} />
                    <ClearButton filter={props.filter} clear={clearFilter} />
                </InputGroup>
            </Form>
        </div>
    )
}

export default Search