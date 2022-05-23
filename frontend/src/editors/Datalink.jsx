import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import Points from '../items/Points'
import Initial from './Datalink.js'
import Check from './Check'
import { useApp } from '../App'

function Editor(props) {
    const app = useApp()
    const [setts, setSetts] = useState(Initial.config().setts)
    const [links, setLinks] = useState(Initial.config().links)
    const [captured, setCaptured] = useState(null)
    useEffect(() => {
        const init = Initial.config()
        const config = props.config
        setSetts(config.setts || init.setts)
        setLinks(config.links || init.links)
    }, [props.id]) //primitive type required
    useEffect(() => {
        if (props.id) { //required to prevent closing validations
            const config = { setts, links }
            const valid = Check.run(() => Initial.validator(config))
            props.setter({ config, valid })
        }
    }, [setts, links])
    function addLink() {
        const next = [...links]
        const link = Initial.link()
        next.push(link)
        setLinks(next)
    }
    function delLink(index) {
        const next = [...links]
        next.splice(index, 1)
        setLinks(next)
    }
    function moveLink(index, inc) {
        const nindex = index + inc
        if (nindex < 0 || nindex >= links.length) return
        const next = [...links]
        next.splice(nindex, 0, next.splice(index, 1)[0])
        setLinks(next)
    }
    function settsProps(prop) {
        function setter(name) {
            return function (value) {
                const next = { ...setts }
                next[name] = value
                setSetts(next)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.labels[prop]
        args.hint = Initial.hints[prop]
        args.value = setts[prop]
        args.setter = setter(prop)
        args.check = Initial.checks[prop]
        args.defval = Initial.setts()[prop]
        return Check.props(args)
    }
    function linkProps(index, prop) {
        function setter(name) {
            return function (value) {
                const next = [...links]
                next[index][name] = value
                setLinks(next)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.labels.links[prop](index)
        args.hint = Initial.hints.links[prop](index)
        args.value = links[index][prop]
        args.setter = setter(prop)
        args.check = (value) => Initial.checks.links[prop](index, value)
        args.defval = Initial.link()[prop]
        return Check.props(args)
    }
    const rows = links.map((link, index) =>
        <tr key={index} className='align-middle'>
            <td>
                {"@" + (index + 1)}
            </td>
            <td>
                <Form.Select {...linkProps(index, "input")}>
                    <option value=""></option>
                    {Points.options(props.globals.inputs)}
                </Form.Select>
            </td>
            <td>
                <Form.Select {...linkProps(index, "output")}>
                    <option value=""></option>
                    {Points.options(props.globals.outputs)}
                </Form.Select>
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delLink(index)}
                    title="Delete Row">
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
                &nbsp;
                <Button variant='outline-secondary' size="sm" onClick={() => moveLink(index, +1)}
                    title="Move Row Down" disabled={index >= links.length - 1}>
                    <FontAwesomeIcon icon={faArrowDown} />
                </Button>
                <Button variant='outline-secondary' size="sm" onClick={() => moveLink(index, -1)}
                    title="Move Row Up" disabled={index < 1}>
                    <FontAwesomeIcon icon={faArrowUp} />
                </Button>
            </td>
        </tr>
    )
    return (
        <Form>
            <Row>
                <Col xs={2}>
                    <FloatingLabel label={Initial.labels.period}>
                        <Form.Control type="number" {...settsProps("period")} min="1" step="1" />
                    </FloatingLabel>
                </Col>
            </Row>

            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{Initial.labels.link.input}</th>
                        <th>{Initial.labels.link.output}</th>
                        <th>
                            <Button variant='outline-primary' size="sm" onClick={addLink}
                                title="Add Link">
                                <FontAwesomeIcon icon={faPlus} />
                            </Button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        </Form>
    )
}

export default Editor
