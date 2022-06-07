import React from 'react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { FormEntry } from './Tools'
import "../fonts/Fonts.css"
import "../fonts/Fonts"
import Initial from "./Trend.js"
import Check from '../common/Check'
import { CartesianGrid, LineChart, Line, XAxis, YAxis } from 'recharts';

function Renderer({ control, size, trend }) {
    const data = control.data
    const full = trend ? trend.values : []
    //local length with accumulated period
    const count = Math.trunc(1000 * data.sampleLength / trend.period)
    const init = Math.max(0, full.length - count)
    const values = full.slice(init, full.length)
    const ymin = Number(data.inputMin)
    const ymax = Number(data.inputMax)
    // const nmin = Number(data.normalMin)
    // const nmax = Number(data.normalMax)
    // const normal = values.filter(e => e.val >= nmin && e.val <= nmax)
    return <svg>
        <foreignObject width={size.width} height={size.height}>
            <LineChart width={size.width} height={size.height} data={values} fill="gray">
                <XAxis dataKey="del" interval="preserveStartEnd"
                    tickFormatter={() => ""} />
                <YAxis domain={[ymin, ymax]}
                    tickFormatter={() => ""} />
                <Line type="monotone"
                    dot={false}
                    isAnimationActive={false}
                    dataKey="val"
                    stroke="blue" />)
                <CartesianGrid strokeDasharray="1 1" />
            </LineChart>
        </foreignObject>
    </svg>
}

function Editor({ control, setProp, globals }) {
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    const data = control.data
    function fieldProps(prop) {
        function setter(name) {
            return function (value) {
                setProp(name, value)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.dlabels[prop]
        args.hint = Initial.dhints[prop]
        args.getter = () => data[prop]
        args.setter = setter(prop)
        args.check = Initial.dchecks[prop]
        args.defval = Initial.data()[prop]
        return Check.props(args)
    }

    return (
        <>
            <FormEntry label={Initial.dlabels.sample}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("samplePeriod")} min="1" />
                    <Form.Control type="number" {...fieldProps("sampleLength")} min="1" />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.inputRange}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("inputMin")} />
                    <Form.Control type="number" {...fieldProps("inputMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.normalRange}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("normalMin")} />
                    <Form.Control type="number" {...fieldProps("normalMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.warningRange}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("warningMin")} />
                    <Form.Control type="number" {...fieldProps("warningMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.criticalColor}>
                <InputGroup>
                    <Form.Control type="color" {...fieldProps("criticalColor")} />
                    <Form.Control type="text" {...fieldProps("criticalColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.warningColor}>
                <InputGroup>
                    <Form.Control type="color" {...fieldProps("warningColor")} />
                    <Form.Control type="text" {...fieldProps("warningColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.normalColor}>
                <InputGroup>
                    <Form.Control type="color" {...fieldProps("normalColor")} />
                    <Form.Control type="text" {...fieldProps("normalColor")} />
                </InputGroup>
            </FormEntry>
        </>
    )
}

const Type = Initial.type
const Init = Initial.data
const Merge = Initial.merge

const Label = { Type, Init, Editor, Renderer, Merge }

export default Label
