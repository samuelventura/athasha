import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Check from '../common/Check'
import Type from '../common/Type'
import Monaco from "../monaco/Monaco"

const $type = Type.Script
const $schema = $type.schema()

function Editor(props) {
    const captured = props.globals.captured
    const setCaptured = props.globals.setCaptured
    const [setts, setSetts] = useState(props.config.setts)
    useEffect(() => {
        const config = props.config
        setSetts(config.setts)
    }, [props.hash])
    useEffect(() => {
        const config = { setts }
        props.setter(config)
    }, [setts])
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
    function onCodeChanged(code) {
        setts.code = code
        setSetts({ ...setts })
    }
    return (
        <Tabs defaultActiveKey="code" className="mb-3">
            <Tab eventKey="code" title="Code">
                <div className="monacoTab">
                    <Monaco code={setts.code} onCodeChanged={onCodeChanged} />
                </div>
            </Tab>
            <Tab eventKey="config" title="Config">
                <Form>
                    <Row>
                        <Col xs={2}>
                            <FloatingLabel label={$schema.setts.period.label}>
                                <Form.Control type="number" {...settsProps("period")} min="1" step="1" />
                            </FloatingLabel>
                        </Col>
                    </Row>
                </Form>
            </Tab>
        </Tabs>
    )
}

export default Editor
