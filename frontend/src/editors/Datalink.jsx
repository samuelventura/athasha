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
const $schema = $type.schema()

function Editor(props) {
    const captured = props.globals.captured
    const setCaptured = props.globals.setCaptured
    const [setts, setSetts] = useState(props.config.setts)
    const [links, setLinks] = useState(props.config.links)
    useEffect(() => {
        const config = props.config
        setSetts(config.setts)
        setLinks(config.links)
    }, [props.hash])
    useEffect(() => {
        const config = { setts, links }
        props.setter(config)
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
        Check.fillProp(args, $schema.setts[prop], prop)
        args.getter = () => setts[prop]
        args.setter = setter(prop)
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
        Check.fillProp(args, $schema.links[prop], prop, index)
        args.getter = () => links[index][prop]
        args.setter = setter(prop)
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
                    <FloatingLabel label={$schema.setts.period.label}>
                        <Form.Control type="number" {...settsProps("period")} min="1" step="1" />
                    </FloatingLabel>
                </Col>
            </Row>

            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{$schema.links.input.header}</th>
                        <th>{$schema.links.factor.header}</th>
                        <th>{$schema.links.offset.header}</th>
                        <th>{$schema.links.output.header}</th>
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
