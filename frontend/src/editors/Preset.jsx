import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import Points from '../common/Points'
import Check from '../common/Check'
import Arrays from '../common/Arrays'
import Type from '../common/Type'

const $type = Type.Preset
const $schema = $type.schema()

function Params({ params, setParams, globals }) {
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    function addParam() {
        const next = [...params]
        const param = $type.param()
        next.push(param)
        setParams(next)
    }
    function delParam(index) {
        const next = [...params]
        next.splice(index, 1)
        setParams(next)
    }
    function moveParam(index, inc) {
        const nindex = index + inc
        if (nindex < 0 || nindex >= params.length) return
        const next = [...params]
        next.splice(nindex, 0, next.splice(index, 1)[0])
        setParams(next)
    }
    function paramProps(index, prop) {
        function setter(name) {
            return function (value) {
                const next = [...params]
                next[index][name] = value
                setParams(next)
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $schema.params[prop], prop, index)
        args.getter = () => params[index][prop]
        args.setter = setter(prop)
        if (prop === "output") {
            //copy output name to param name
            args.onChange = (e) => {
                const target = e.target
                const option = target.options[target.selectedIndex]
                const text = option.text
                //invalid output will return to previous
                //valid value leaving name blank
                if (text) setter("name")(text)
            }
        }
        return Check.props(args)
    }
    const paramRows = params.map((param, index) =>
        <tr key={index} className='align-middle'>
            <td>
                {"#" + (index + 1)}
            </td>
            <td>
                <Form.Select {...paramProps(index, "output")}>
                    <option value=""></option>
                    {Points.options(globals.outputs)}
                </Form.Select>
            </td>
            <td>
                <Form.Control type="text" {...paramProps(index, "name")} />
            </td>
            <td>
                <Form.Control type="text" {...paramProps(index, "desc")} />
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delParam(index)}
                    title="Delete Row">
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
                &nbsp;
                <Button variant='outline-secondary' size="sm" onClick={() => moveParam(index, +1)}
                    title="Move Row Down" disabled={index >= params.length - 1}>
                    <FontAwesomeIcon icon={faArrowDown} />
                </Button>
                <Button variant='outline-secondary' size="sm" onClick={() => moveParam(index, -1)}
                    title="Move Row Up" disabled={index < 1}>
                    <FontAwesomeIcon icon={faArrowUp} />
                </Button>
            </td>
        </tr>
    )
    return <Table>
        <thead>
            <tr>
                <th>#</th>
                <th>{$schema.params.output.header}</th>
                <th>{$schema.params.name.header}</th>
                <th>{$schema.params.desc.header}</th>
                <th>
                    <Button variant='outline-primary' size="sm" onClick={addParam}
                        title="Add Param">
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </th>
            </tr>
        </thead>
        <tbody>
            {paramRows}
        </tbody>
    </Table>
}

function Tags({ tags, setTags, programs, globals }) {
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    function addTag() {
        const next = [...tags]
        const tag = $type.tag()
        next.push(tag)
        setTags(next)
    }
    function delTag(index) {
        const next = [...tags]
        next.splice(index, 1)
        setTags(next)
    }
    function moveTag(index, inc) {
        const nindex = index + inc
        if (nindex < 0 || nindex >= tags.length) return
        const next = [...tags]
        next.splice(nindex, 0, next.splice(index, 1)[0])
        setTags(next)
    }
    function tagProps(index, prop) {
        function setter(name) {
            return function (value) {
                const next = [...tags]
                next[index][name] = value
                setTags(next)
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $schema.tags[prop], prop, index)
        args.getter = () => tags[index][prop]
        args.setter = setter(prop)
        return Check.props(args)
    }
    const programNames = Arrays.unique(programs.map(v => v.name))
    const programOptions = programNames.map(v => <option key={v} value={v}>{v}</option>)
    const tagRows = tags.map((tag, index) =>
        <tr key={index} className='align-middle'>
            <td>
                {"#" + (index + 1)}
            </td>
            <td>
                <Form.Control type="text" {...tagProps(index, "name")} />
            </td>
            <td>
                <Form.Select {...tagProps(index, "program")}>
                    <option value=""></option>
                    {programOptions}
                </Form.Select>
            </td>
            <td>
                <Form.Control type="text" {...tagProps(index, "desc")} />
            </td>
            <td>
                <Button variant='outline-danger' size="sm" onClick={() => delTag(index)}
                    title="Delete Row">
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
                &nbsp;
                <Button variant='outline-secondary' size="sm" onClick={() => moveTag(index, +1)}
                    title="Move Row Down" disabled={index >= tags.length - 1}>
                    <FontAwesomeIcon icon={faArrowDown} />
                </Button>
                <Button variant='outline-secondary' size="sm" onClick={() => moveTag(index, -1)}
                    title="Move Row Up" disabled={index < 1}>
                    <FontAwesomeIcon icon={faArrowUp} />
                </Button>
            </td>
        </tr>
    )
    return <Table>
        <thead>
            <tr>
                <th>#</th>
                <th>{$schema.tags.name.header}</th>
                <th>{$schema.tags.program.header}</th>
                <th>{$schema.tags.desc.header}</th>
                <th>
                    <Button variant='outline-primary' size="sm" onClick={addTag}
                        title="Add Tag">
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </th>
            </tr>
        </thead>
        <tbody>
            {tagRows}
        </tbody>
    </Table>
}

function Programs({ programs, setPrograms, params, globals }) {
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    function addProgram() {
        const next = [...programs]
        const program = $type.program(next.length)
        const defval = $type.programParam().value
        program.params = params.map(p => {
            const output = p.output
            const value = defval
            return { output, value }
        })
        next.push(program)
        setPrograms(next)
    }
    function delProgram(index) {
        const next = [...programs]
        next.splice(index, 1)
        setPrograms(next)
    }
    function moveProgram(index, inc) {
        const nindex = index + inc
        if (nindex < 0 || nindex >= programs.length) return
        const next = [...programs]
        next.splice(nindex, 0, next.splice(index, 1)[0])
        setPrograms(next)
    }
    function programProps(index, prop) {
        function setter(name) {
            return function (value) {
                const next = [...programs]
                next[index][name] = value
                setPrograms(next)
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $schema.programs[prop], prop, index)
        args.getter = () => programs[index][prop]
        args.setter = setter(prop)
        return Check.props(args)
    }
    const programRows = programs.map((program, index) => {
        const local = params.map((p, i) => {
            const desc = p.desc
            const name = p.name
            return { ...program.params[i], name, desc }
        })
        function setParams(params) {
            const local = params.map(p => {
                const output = p.output
                const value = p.value
                return { output, value }
            })
            const next = [...programs]
            next[index].params = local
            setPrograms(next)
        }
        const paramProps = { params: local, setParams, globals, prefix: index }
        return <tbody key={index}>
            <tr className='align-middle'>
                <td>
                    {"#" + (index + 1)}
                </td>
                <td>
                    <Form.Control type="text" {...programProps(index, "name")} />
                </td>
                <td>
                    <Form.Control type="text" {...programProps(index, "desc")} />
                </td>
                <td>
                    <Button variant='outline-danger' size="sm" onClick={() => delProgram(index)}
                        title="Delete Row">
                        <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    &nbsp;
                    <Button variant='outline-secondary' size="sm" onClick={() => moveProgram(index, +1)}
                        title="Move Row Down" disabled={index >= programs.length - 1}>
                        <FontAwesomeIcon icon={faArrowDown} />
                    </Button>
                    <Button variant='outline-secondary' size="sm" onClick={() => moveProgram(index, -1)}
                        title="Move Row Up" disabled={index < 1}>
                        <FontAwesomeIcon icon={faArrowUp} />
                    </Button>
                </td>
            </tr>
            <tr className='align-middle'>
                <td></td>
                <td colSpan="3">
                    <ProgramParams {...paramProps} />
                </td>
            </tr>
        </tbody>
    })
    return <Table>
        <thead>
            <tr>
                <th>#</th>
                <th>{$schema.programs.name.header}</th>
                <th>{$schema.programs.desc.header}</th>
                <th>
                    <Button variant='outline-primary' size="sm" onClick={addProgram}
                        title="Add Program">
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </th>
            </tr>
        </thead>
        {programRows}
    </Table>
}

function ProgramParams({ prefix, params, setParams, globals }) {
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    function paramProps(index, prop) {
        function setter(name) {
            return function (value) {
                const next = [...params]
                //update all with same output
                const param = next[index]
                next.forEach(p => {
                    if (p.output == param.output) {
                        p[name] = value
                    }
                })
                setParams(next)
            }
        }
        const args = { captured, setCaptured }
        Check.fillProp(args, $schema.programs.params[prop], prop, index)
        args.getter = () => params[index][prop]
        args.setter = setter(prop)
        return Check.props(args)
    }
    const paramRows = params.map((param, index) =>
        <tr key={`${prefix}_${index}`} title={param.desc} className='align-middle'>
            <td>
                {param.name}
            </td>
            <td>
                <Form.Control type="number" {...paramProps(index, "value")} />
            </td>
        </tr>
    )
    return <Table>
        <thead>
            <tr>
                <th>Param</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            {paramRows}
        </tbody>
    </Table>
}

function Editor(props) {
    const globals = props.globals
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    const [setts, setSetts] = useState(props.config.setts)
    const [params, setParams] = useState(props.config.params)
    const [programs, setPrograms] = useState(props.config.programs)
    const [tags, setTags] = useState(props.config.tags)
    useEffect(() => {
        const config = props.config
        setSetts(config.setts)
        setParams(config.params)
        setPrograms(config.programs)
        setTags(config.tags)
    }, [props.hash])
    useEffect(() => {
        const config = { setts, params, programs, tags }
        props.setter(config)
    }, [setts, params, programs, tags])
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
    function syncParams(params) {
        //keep program params array in sync with preset params
        const defval = $type.programParam().value
        programs.forEach(program => {
            const values = program.params.reduce((m, p) => {
                m[p.output] = p.value
                return m
            }, {})
            program.params = params.map(p => {
                const output = p.output
                const value = (p.output in values) ? values[p.output] : defval
                return { output, value }
            })
        })
        setPrograms([...programs])
        setParams(params)
    }
    const paramsProps = { params, setParams: syncParams, globals }
    const programsProps = { programs, setPrograms, params, globals }
    const tagsProps = { tags, setTags, programs, globals }
    return (
        <Form>
            <Row>
                <Col xs={2}>
                    <FloatingLabel label={$schema.setts.name.label}>
                        <Form.Control type="text" {...settsProps("name")} />
                    </FloatingLabel>
                </Col>
            </Row>

            <Tabs defaultActiveKey="params" className="mt-3 mb-3">
                <Tab eventKey="params" title="Params">
                    <Params {...paramsProps} />
                </Tab>
                <Tab eventKey="programs" title="Programs">
                    <Programs {...programsProps} />
                </Tab>
                <Tab eventKey="tags" title="Tags">
                    <Tags {...tagsProps} />
                </Tab>
            </Tabs>
        </Form>
    )
}

export default Editor
