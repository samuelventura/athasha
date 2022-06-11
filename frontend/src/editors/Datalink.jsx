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
import Points from '../common/Points'
import Check from '../common/Check'
import Type from '../common/Type'

const $type = Type.Datalink
const $config = $type.config()

function Editor(props) {
    const captured = props.globals.captured
    const setCaptured = props.globals.setCaptured
    const [setts, setSetts] = useState($config.setts)
    const [links, setLinks] = useState($config.links)
    useEffect(() => {
        const config = props.config
        setSetts(config.setts)
        setLinks(config.links)
    }, [props.id])
    useEffect(() => {
        if (props.id) { //required to prevent closing validations
            const config = { setts, links }
            props.setter(config)
        }
    }, [setts, links])
    function addLink() {
        const next = [...links]
        const link = $type.link()
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
                setts[name] = value
                setSetts({ ...setts })
            }
        }
        const args = { captured, setCaptured }
        args.label = $type.labels[prop]
        args.hint = $type.hints[prop]
        args.getter = () => setts[prop]
        args.setter = setter(prop)
        args.check = $type.checks[prop]
        args.defval = $type.setts()[prop]
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
        args.label = $type.labels.links[prop](index)
        args.hint = $type.hints.links[prop](index)
        args.getter = () => links[index][prop]
        args.setter = setter(prop)
        args.check = (value) => $type.checks.links[prop](index, value)
        args.defval = $type.link()[prop]
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
                <Form.Control type="number" {...linkProps(index, "factor")} />
            </td>
            <td>
                <Form.Control type="number" {...linkProps(index, "offset")} />
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
                    <FloatingLabel label={$type.labels.period}>
                        <Form.Control type="number" {...settsProps("period")} min="1" step="1" />
                    </FloatingLabel>
                </Col>
            </Row>

            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{$type.labels.link.input}</th>
                        <th>{$type.labels.link.factor}</th>
                        <th>{$type.labels.link.offset}</th>
                        <th>{$type.labels.link.output}</th>
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
